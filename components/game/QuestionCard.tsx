import { Question } from "../../lib/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export default function QuestionCard({
  question,
  questionNumber,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="text-xl mb-4">Question {questionNumber}</div>
      <h2
        className="text-2xl font-bold mb-6"
        dangerouslySetInnerHTML={{ __html: question.text }}
      />
      <div className="grid grid-cols-2 gap-4">
        {question.answers.map((answer, index) => (
          <div
            key={index}
            className="p-4 bg-gray-100 rounded-lg"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        ))}
      </div>
    </div>
  );
}
