import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Stepper from '../../components/features/event/Stepper';
import Button from '../../components/ui/Button';
import { setCurrentStep } from '../../store/slices/eventSlice';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BasicInfoForm from '../../components/features/event/BasicInfoForm';
import ShowsInfoForm from '../../components/features/event/ShowsInfoForm';

const CreateEventPage = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.event.currentStep);
  const totalSteps = 3;

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      dispatch(setCurrentStep(currentStep + 1));
    } else {
      handlePublish();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handlePublish = () => {
    console.log('Publishing event...');
  };

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm />;
      case 2:
        return <ShowsInfoForm />;
      case 3:
        return <div>Component Xuất bản sẽ ở đây</div>;
      default:
        return <div>Component Form thông tin cơ bản sẽ ở đây</div>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Stepper />

      <div className="mb-12">{renderCurrentStepComponent()}</div>

      <div className="border-border-default flex items-center justify-between border-t pt-6">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost">Lưu nháp</Button>
          <Button onClick={handleNextStep}>
            {currentStep === totalSteps ? 'Xuất bản sự kiện' : 'Tiếp theo'}
            {currentStep < totalSteps && (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
