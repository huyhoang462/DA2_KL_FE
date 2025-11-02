import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/lib';
import { setCurrentStep } from '../../../store/slices/eventSlice';

const steps = [
  { id: 1, name: 'Thông tin cơ bản' },
  { id: 2, name: 'Lịch diễn & Vé' },
  { id: 3, name: 'Xuất bản' },
];

export default function Stepper() {
  const currentStep = useSelector((state) => state.event.currentStep);
  const dispatch = useDispatch();

  const handleStepClick = (stepId) => {
    console.log('curent step: ', stepId);

    if (stepId < currentStep) dispatch(setCurrentStep(stepId));
  };

  const progressPercent =
    steps.length > 1
      ? ((Math.max(0, currentStep - 1) / (steps.length - 1)) * 100).toFixed(2)
      : 0;

  return (
    <nav aria-label="Progress">
      <div className="relative w-full px-4">
        <div
          className="bg-border-default absolute top-4 right-4 left-4 h-[2px]"
          aria-hidden="true"
        />
        <div
          className="bg-primary transition-width absolute top-4 left-4 h-[2px]"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />
        <ol
          role="list"
          className="relative z-10 flex w-full items-center gap-0"
        >
          {steps.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <li
                key={step.id}
                className="flex flex-1 flex-col items-center text-center"
              >
                <div className="relative z-20">
                  {isDone ? (
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="bg-primary hover:bg-primary-hover text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full"
                      aria-label={step.name}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : isCurrent ? (
                    <div
                      className="border-primary bg-background-secondary flex h-8 w-8 items-center justify-center rounded-full border-2"
                      aria-current="step"
                    >
                      <span className="bg-primary h-2.5 w-2.5 rounded-full" />
                    </div>
                  ) : (
                    <div className="border-border-default bg-background-secondary flex h-8 w-8 items-center justify-center rounded-full border-2">
                      {/* empty */}
                    </div>
                  )}
                </div>

                <p
                  className={cn(
                    'mt-2 text-xs whitespace-nowrap',
                    isDone || isCurrent
                      ? 'text-text-primary font-semibold'
                      : 'text-text-secondary'
                  )}
                >
                  {step.name}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
