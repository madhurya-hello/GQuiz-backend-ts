import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizSection } from './entities/quiz-section.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { ClassQuiz } from '../classes/entities/class-quiz.entity';

@Injectable()
export class QuizService {
  constructor(private dataSource: DataSource) {}

  async create(createQuizDto: any, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the Quiz Root
      const quiz = new Quiz();

      quiz.user_id = userId;

      if (createQuizDto.class_id) {
        quiz.class_id = +createQuizDto.class_id; 
      } else {
        quiz.class_id = null;
      }

      quiz.name = createQuizDto.name;
      quiz.description = createQuizDto.description;
      quiz.status = createQuizDto.status;
      quiz.validity_quiz_start = new Date(createQuizDto.validity_quiz_start);
      quiz.validity_quiz_end = new Date(createQuizDto.validity_quiz_end);
      quiz.quiz_duration = createQuizDto.quiz_duration;
      
      // Merge constraints and violation rules into one JSON blob
      quiz.settings = {
        constraints: createQuizDto.constraints,
        upon_violation: createQuizDto.upon_violation,
      };
      
      quiz.access_control = createQuizDto.quiz_access;

      const savedQuiz = await queryRunner.manager.save(quiz);

      // If linked to a class, update the ClassQuiz table
      if (savedQuiz.class_id) {
        const classQuiz = new ClassQuiz();
        classQuiz.class_id = savedQuiz.class_id;
        classQuiz.quiz_id = savedQuiz.id;
        await queryRunner.manager.save(classQuiz);
      }

      // 2. Process Sections
      const incomingSections = createQuizDto.quiz_section.sections;

      for (const secData of incomingSections) {
        const section = new QuizSection();
        section.quiz = savedQuiz;
        section.section_no = secData.section_no;
        section.section_name = secData.section_name;
        section.total_section_marks = secData.total_section_marks;
        
        // Store section-specific settings in JSON
        section.section_settings = {
          questions_style: secData.questions_style,
          time_limit: secData.time_limit,
          questions_limit: secData.questions_limit,
          shuffle_questions: secData.shuffle_questions,
          shuffle_question_order: secData.shuffle_question_order,
        };

        const savedSection = await queryRunner.manager.save(section);

        // 3. Process Questions
        for (const qData of secData.questions) {
          const question = new Question();
          question.section = savedSection;
          question.question_text = qData.question_text;
          question.image_urls = qData.image_urls;
          question.answer_type = qData.answer_type;
          question.positive_mark = qData.positive_mark;
          question.negative_mark = qData.negative_mark;
          question.is_compulsory = qData.is_compulsory;

          // Store Type-Specific Data (Code config, etc.) in Metadata
          const { code_config, auto_evaluate_using_ai, mcq_type } = qData;
          question.metadata = {
            code_config, // Will be null for MCQs, handled automatically
            auto_evaluate_using_ai,
            mcq_type
          };

          const savedQuestion = await queryRunner.manager.save(question);

          // 4. Process Options (Only for MCQ)
          if (qData.options && qData.options.length > 0) {
            const optionsToSave = qData.options.map((opt) => {
              const option = new QuestionOption();
              option.question = savedQuestion;
              option.option_no = opt.option_no;
              option.text = opt.text;
              option.image_urls = opt.image_urls;
              // Check if this option index is in the correct_options_index array
              // Note: Payload uses 0-based index for correctness
              option.is_correct = qData.correct_options_index.includes(qData.options.indexOf(opt));
              return option;
            });
            await queryRunner.manager.save(optionsToSave);
          }
        }
      }

      await queryRunner.commitTransaction();
      return { message: 'Quiz created successfully', quiz_id: savedQuiz.id };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}