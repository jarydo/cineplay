interface AnswerGridProps {
  answers: string[];
  onAnswer: (index: number) => void;
  disabled?: boolean;
}

export default function AnswerGrid({
  answers,
  onAnswer,
  disabled,
}: AnswerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {answers.map((answer, index) => (
        <button
          key={index}
          onClick={() => onAnswer(index)}
          disabled={disabled}
          className={`
              p-4 rounded-lg text-left transition-colors
              ${
                disabled
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-white hover:bg-blue-50 active:bg-blue-100"
              }
            `}
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      ))}
    </div>
  );
}
