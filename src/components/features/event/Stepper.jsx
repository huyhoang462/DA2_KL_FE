// src/components/event-creation/Stepper.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check, Circle } from 'lucide-react';
import { cn } from '../../../utils/lib';
import { setCurrentStep } from '../../../store/slices/eventSlice';

// Định nghĩa các bước của quy trình
const steps = [
  { id: 1, name: 'Thông tin cơ bản' },
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
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              'relative',
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
            )}
          >
            {currentStep > step.id ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="bg-primary h-0.5 w-full" />
                </div>
                <button
                  onClick={() => handleStepClick(step.id)}
                  className="bg-primary hover:bg-primary-hover relative flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <Check
                    className="text-primary-foreground h-5 w-5"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </button>
              </>
            ) : currentStep === step.id ? (
              // Bước hiện tại
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="bg-border-default h-0.5 w-full" />
                </div>
                <div
                  className="border-primary bg-background-secondary relative flex h-8 w-8 items-center justify-center rounded-full border-2"
                  aria-current="step"
                >
                  <span
                    className="bg-primary h-2.5 w-2.5 rounded-full"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : (
              // Bước chưa tới
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="bg-border-default h-0.5 w-full" />
                </div>
                <div className="group border-border-default bg-background-secondary relative flex h-8 w-8 items-center justify-center rounded-full border-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-transparent"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            )}

            {/* Tên của bước */}
            <p
              className={cn(
                'absolute -bottom-6 w-full text-center text-xs whitespace-nowrap',
                currentStep >= step.id
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary'
              )}
            >
              {step.name}
            </p>
          </li>
        ))}
      </ol>
    </nav>
  );
}
