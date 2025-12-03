import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import set from 'lodash.set';

import Stepper from '../../components/features/createEvent/Stepper';
import Button from '../../components/ui/Button';
import NotificationModal from '../../components/ui/NotificationModal';
import BasicInfoForm from '../../components/features/createEvent/BasicInfoForm';
import ShowsInfoForm from '../../components/features/createEvent/ShowsInfoForm';
import PaymentInfoForm from '../../components/features/createEvent/PaymentInfoForm';

import {
  setCurrentStep,
  updateEventField,
  clearEvent,
  clearPayoutMethod,
} from '../../store/slices/eventSlice';
import {
  validateStepOne,
  validateStepTwo,
  validateStepThree,
} from '../../utils/validation';
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
  const [notificationInfo, setNotificationInfo] = useState({
    type: 'success',
    title: '',
    message: '',
  });

  const handleFieldChange = (field, value) => {
    dispatch(updateEventField({ field, value }));

    let errorKey;
    if (field.startsWith('payoutMethod')) {
      errorKey = field.split('.')[1];
    } else errorKey = field.split('.')[0];

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
    } else if (currentStep === 3) {
      validationErrors = validateStepThree(eventData);
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (currentStep < totalSteps) {
        dispatch(setCurrentStep(currentStep + 1));
      } else {
        handleSubmit();
      }
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
    console.log('Submitting event data:', eventData);
    setIsSubmitting(true);
    try {
      const result = await createEvent(eventData);
      setNotificationInfo({
        type: 'success',
        title: 'Thành công!',
        message: 'Sự kiện của bạn đã được tạo và gửi đi xét duyệt.',
      });
      setShowNotification(true);
    } catch (error) {
      setNotificationInfo({
        type: 'error',
        title: 'Thất bại!',
        message: error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      });
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    if (notificationInfo.type === 'success') {
      dispatch(clearEvent());
      nav('/organizer/my-events');
    }
  };

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm
            value={eventData}
            onChange={handleFieldChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <ShowsInfoForm
            value={eventData.shows}
            onChange={handleFieldChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <PaymentInfoForm
            value={eventData.payoutMethod}
            onChange={handleFieldChange}
            errors={errors}
          />
        );
      default:
        return (
          <div className="w-full text-center text-5xl font-medium">ERROR</div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col pt-13 md:pt-0">
      {/* Header giữ nguyên */}
      <header className="border-border-default bg-background-primary/80 sticky top-13 z-10 mb-4 border-b backdrop-blur-sm md:top-0">
        <div className="mx-auto flex min-h-16 flex-wrap items-center justify-between gap-y-2 px-4 py-2 md:mt-0">
          <div className="flex items-center gap-4">
            <div className="block">
              <Stepper />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Lưu nháp
            </Button>
            <Button
              size="sm"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="hidden sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleNextStep} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === totalSteps ? (
                'Gửi duyệt'
              ) : (
                <>
                  Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content giữ nguyên */}
      <div
        className={`container mx-auto transition-opacity ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div className="mb-8">{renderCurrentStepComponent()}</div>
      </div>

      {/* Notification Modal giữ nguyên */}
      <NotificationModal
        isOpen={showNotification}
        type={notificationInfo.type}
        title={notificationInfo.title}
        message={notificationInfo.message}
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default CreateEventPage;
