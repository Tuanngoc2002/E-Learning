import type { Schema, Struct } from '@strapi/strapi';

export interface ExamQuestion extends Struct.ComponentSchema {
  collectionName: 'components_exam_questions';
  info: {
    description: '';
    displayName: 'Question';
  };
  attributes: {
    correctAnswer: Schema.Attribute.String & Schema.Attribute.Required;
    options: Schema.Attribute.JSON & Schema.Attribute.Required;
    questionText: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'exam.question': ExamQuestion;
    }
  }
}
