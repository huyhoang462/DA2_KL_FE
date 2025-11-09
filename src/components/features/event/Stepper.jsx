import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/lib';
import { setCurrentStep } from '../../../store/slices/eventSlice';

const steps = [
  { id: 1, name: 'Thông tin' },
  { id: 2, name: 'Lịch diễn & Vé' },
  { id: 3, name: 'Xuất bản' },
];

export default function Stepper() {
  const currentStep = useSelector((state) => state.event.currentStep);
  const dispatch = useDispatch();

  const handleStepClick = (stepId) => {
    if (stepId < currentStep) {
      dispatch(setCurrentStep(stepId));
    }
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center space-x-4">
        {steps.map((step, stepIdx) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.name} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  isDone &&
                    'bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer',
                  isCurrent && 'border-primary text-primary border-2',
                  !isDone &&
                    !isCurrent &&
                    'border-border-default text-text-secondary cursor-default border-2'
                )}
                disabled={!isDone}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.id}
              </button>

              <span
                className={cn(
                  'ml-2 text-sm font-medium',
                  isCurrent ? 'text-text-primary' : 'text-text-secondary',
                  isDone && 'hover:text-text-primary cursor-pointer'
                )}
                onClick={() => handleStepClick(step.id)}
              >
                {step.name}
              </span>

              {stepIdx !== steps.length - 1 && (
                <div
                  className={cn(
                    'ml-4 h-0.5 w-8 flex-auto',
                    isDone ? 'bg-primary' : 'bg-border-default'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
