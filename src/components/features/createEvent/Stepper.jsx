import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/lib';
import { setCurrentStep } from '../../../store/slices/eventSlice';
import { ChevronRight } from 'lucide-react';
const steps = [
  { id: 1, name: 'Thông tin sự kiện' },
  { id: 2, name: 'Lịch diễn & Vé' },
  { id: 3, name: 'Thông tin thanh toán' },
];

export default function Stepper() {
  const currentStep = useSelector((state) => state.event.currentStep);
  const dispatch = useDispatch();

  const handleStepClick = (stepId) => {
    // Cho phép quay lại các bước đã hoàn thành
    if (stepId < currentStep) {
      dispatch(setCurrentStep(stepId));
    }
  };

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-x-2">
        {steps.map((step, stepIdx) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.name}>
              <li className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isDone &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer',
                    isCurrent && 'border-primary text-primary border-2',
                    !isDone &&
                      !isCurrent &&
                      'border-border-default text-text-secondary border-2'
                  )}
                  disabled={!isDone && !isCurrent}
                >
                  {isDone ? <Check className="h-4 w-4" /> : step.id}
                </button>

                <span
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    'text-sm font-medium select-none',
                    isCurrent
                      ? 'text-text-primary ml-2 hidden sm:block'
                      : 'text-text-secondary hidden sm:ml-2 lg:block',
                    isDone && 'hover:text-text-primary cursor-pointer'
                  )}
                >
                  {step.name}
                </span>
              </li>

              {stepIdx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
