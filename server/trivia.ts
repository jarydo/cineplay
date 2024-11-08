import { Question } from "../lib/types";

export async function fetchQuestion(): Promise<Question> {
  const response = await fetch(
    "https://opentdb.com/api.php?amount=1&category=11&difficulty=easy&type=multiple"
  );
  const data = await response.json();
  const question = data.results[0];

  const answers = [...question.incorrect_answers, question.correct_answer].sort(
    () => Math.random() - 0.5
  );

  return {
    text: question.question,
    answers,
    correct_answer_index: answers.indexOf(question.correct_answer),
  };
}
