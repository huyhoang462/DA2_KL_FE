import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Stepper from '../../components/features/event/Stepper';
import Button from '../../components/ui/Button';
import {
  setCurrentStep,
  updateEventField,
} from '../../store/slices/eventSlice';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BasicInfoForm from '../../components/features/event/BasicInfoForm';
import ShowsInfoForm from '../../components/features/event/ShowsInfoForm';
import { validateStepOne, validateStepTwo } from '../../utils/validation';
import PaymentInfoForm from '../../components/features/event/PaymentInfoForm';

const CreateEventPage = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.event.currentStep);
  const eventData = useSelector((state) => state.event.event);
  const totalSteps = 3;

  const [errors, setErrors] = useState({});

  const handleChangeStep1 = (field, value) => {
    dispatch(updateEventField({ field, value }));

    const errorKey = field.split('.')[0];

    if (errors[errorKey]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };

        delete newErrors[errorKey];

        return newErrors;
      });
    }
  };
  const handleChangeStep2 = (showIndex, field) => {
    if (
      errors.shows &&
      errors.shows[showIndex] &&
      errors.shows[showIndex][field]
    ) {
      setErrors((prevErrors) => {
        const newShowErrors = [...prevErrors.shows];

        const currentShowErrors = newShowErrors[showIndex]
          ? { ...newShowErrors[showIndex] }
          : {};

        delete currentShowErrors[field];

        newShowErrors[showIndex] =
          Object.keys(currentShowErrors).length > 0
            ? currentShowErrors
            : undefined;

        return {
          ...prevErrors,
          shows: newShowErrors,
        };
      });
    }
  };

  const handleNextStep = () => {
    let validationErrors = {};
    if (currentStep === 1) {
      validationErrors = validateStepOne(eventData);
    } else if (currentStep === 2) {
      validationErrors = validateStepTwo(eventData);
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      dispatch(setCurrentStep(currentStep + 1));
    } else {
      console.log('Validation errors:', validationErrors);
    }
  };
  const handlePrevStep = () => {
    setErrors({});
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm errors={errors} onFieldUpdate={handleChangeStep1} />
        );
      case 2:
        return <ShowsInfoForm errors={errors} onChange={handleChangeStep2} />;
      case 3:
        return <PaymentInfoForm errors={errors} />;
      default:
        return <div>Component Form thông tin cơ bản sẽ ở đây</div>;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-border-default bg-background-primary/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto mt-14 flex h-16 items-center justify-between px-4 md:mt-0">
          <div className="flex items-center gap-4">
            <div className="md:block">
              <Stepper />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Lưu nháp
            </Button>

            <Button
              size="sm"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              variant={currentStep === 1 ? 'disabled' : 'default'}
              className="hidden sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={handleNextStep}
              disabled={currentStep > totalSteps}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto">
        <div className="mb-6">
          {/* Optional: show small breadcrumb or step title */}
        </div>

        <div className="mb-12">{renderCurrentStepComponent()}</div>
      </div>
    </div>
  );
};

export default CreateEventPage;
