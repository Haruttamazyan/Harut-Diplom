type MultipleChoiceQuestionType = 'multiple-choice';
type TextQuestionType = 'text';
type YesNoQuestionType = 'yes-no';

export const MULTIPLE_CHOICE_QUESTION_TYPE: MultipleChoiceQuestionType =
  'multiple-choice';

export const TEXT_QUESTION_TYPE: TextQuestionType =
  'text';

export const YES_NO_QUESTION_TYPE: YesNoQuestionType =
  'yes-no';

export type QuestionType =
  MultipleChoiceQuestionType |
  TextQuestionType |
  YesNoQuestionType;

export const QuestionTypeArr: QuestionType[] = [
  MULTIPLE_CHOICE_QUESTION_TYPE,
  TEXT_QUESTION_TYPE,
  YES_NO_QUESTION_TYPE
];
