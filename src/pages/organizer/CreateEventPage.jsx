import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Stepper from '../../components/features/createEvent/Stepper';
import Button from '../../components/ui/Button';
import NotificationModal from '../../components/ui/NotificationModal';
import {
  setCurrentStep,
  updateEventField,
} from '../../store/slices/eventSlice';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import BasicInfoForm from '../../components/features/createEvent/BasicInfoForm';
import ShowsInfoForm from '../../components/features/createEvent/ShowsInfoForm';
import {
  validateStepOne,
  validateStepThree,
  validateStepTwo,
} from '../../utils/validation';
import PaymentInfoForm from '../../components/features/createEvent/PaymentInfoForm';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../services/eventService';

const CreateEventPage = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.event.currentStep);
  const eventData = useSelector((state) => state.event.event);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

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

  const handleChangeStep3 = (field) => {
    const errorKey = field.split('.')[0];

    if (errors[errorKey]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    let validationErrors = {};
    if (currentStep === 1) {
      validationErrors = validateStepOne(eventData);
    } else if (currentStep === 2) {
      validationErrors = validateStepTwo(eventData);
    } else if (currentStep === 3) {
      validationErrors = validateStepThree(eventData);
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (currentStep < 3) dispatch(setCurrentStep(currentStep + 1));
      else handleSubmit();
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

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createEvent(eventData);

      if (result.status === 201) {
        setNotificationType('success');
        setNotificationTitle('Thành công!');
        setNotificationMessage(result.message);
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Lỗi khi tạo sự kiện:', error);
      setNotificationType('error');
      setNotificationTitle('Thất bại!');
      setNotificationMessage(
        error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    if (notificationType === 'success') {
      nav('/organizer/my-events');
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
        return <PaymentInfoForm errors={errors} onChange={handleChangeStep3} />;
      default:
        return (
          <div className="w-full text-center text-5xl font-medium">ERROR</div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col pt-13 md:pt-0">
      <header className="border-border-default bg-background-primary/80 sticky top-13 z-10 mb-4 border-b backdrop-blur-sm md:top-0">
        <div className="mx-auto flex min-h-16 flex-wrap items-center justify-between gap-y-2 px-4 py-2 md:mt-0">
          <div className="flex items-center gap-4">
            <div className="block">
              <Stepper />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="border" size="sm">
              Lưu
            </Button>

            <Button
              size="sm"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isSubmitting}
              variant={currentStep === 1 ? 'disabled' : 'default'}
              className="hidden sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button size="sm" onClick={handleNextStep} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === 3 ? (
                'Tạo'
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div
        className={`container mx-auto transition-opacity ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="mb-8">{renderCurrentStepComponent()}</div>
      </div>

      <NotificationModal
        isOpen={showNotification}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
        onClose={handleNotificationClose}
        buttonText={notificationType === 'success' ? 'Ok' : 'Thử lại'}
      />
    </div>
  );
};

export default CreateEventPage;
