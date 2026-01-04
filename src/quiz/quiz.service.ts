import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizSection } from './entities/quiz-section.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { ClassQuiz } from '../classes/entities/class-quiz.entity';
import { ClassMember } from '../classes/entities/class-member.entity';

@Injectable()
export class QuizService {
  constructor(private dataSource: DataSource) {}

  async create(createQuizDto: any, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the Quiz Root
      const quiz = new Quiz();
      quiz.user_id = userId;

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

      const access = createQuizDto.quiz_access || {};
      
      quiz.allowed_emails = access.allowed_emails || createQuizDto.allowed_emails || [];
      quiz.blocked_emails = access.blocked_emails || createQuizDto.blocked_emails || [];
      quiz.allowed_email_domains = access.allowed_email_domains || createQuizDto.allowed_email_domains || [];
      quiz.blocked_email_domains = access.blocked_email_domains || createQuizDto.blocked_email_domains || [];

      const savedQuiz = await queryRunner.manager.save(quiz);

      const allowedClassIds = access.allowed_classes || createQuizDto.allowed_classes || [];
      
      if (allowedClassIds.length > 0) {
        const classQuizzesToSave = allowedClassIds.map((classId: number) => {
          const cq = new ClassQuiz();
          cq.class_id = classId;
          cq.quiz_id = savedQuiz.id;
          return cq;
        });
        await queryRunner.manager.save(ClassQuiz, classQuizzesToSave);
      }


      // Calculate and Log Emails

      // A. Get emails from Class Members
      let classMemberEmails: string[] = [];
      if (allowedClassIds.length > 0) {
        const members = await queryRunner.manager.find(ClassMember, {
          where: { class_id: In(allowedClassIds) },
          relations: ['user'],
        });
        classMemberEmails = members.map((m) => m.user.email);
      }
      // B. Combine with explicitly allowed emails
      const rawAllowedEmails = access.allowed_emails || createQuizDto.allowed_emails || [];
      const allPotentialEmails = [...rawAllowedEmails, ...classMemberEmails];
      
      // C. Remove Duplicates
      const uniqueEmails = [...new Set(allPotentialEmails)];
      
      // D. Filter out Blocked Emails
      const blockedEmails = access.blocked_emails || createQuizDto.blocked_emails || [];
      const finalEmailList = uniqueEmails.filter(
        (email) => !blockedEmails.includes(email)
      );

      console.log(`Sending emails to: ${finalEmailList.join(', ')}`);
      

      // Process Sections
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

        // Process Questions
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
            code_config, 
            auto_evaluate_using_ai,
            mcq_type
          };

          const savedQuestion = await queryRunner.manager.save(question);

          // Process Options (Only for MCQ)
          if (qData.options && qData.options.length > 0) {
            const optionsToSave = qData.options.map((opt) => {
              const option = new QuestionOption();
              option.question = savedQuestion;
              option.option_no = opt.option_no;
              option.text = opt.text;
              option.image_urls = opt.image_urls;
              // Check if this option index is in the correct_options_index array
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