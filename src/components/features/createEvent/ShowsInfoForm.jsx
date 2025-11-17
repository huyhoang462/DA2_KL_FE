import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';
import { addShowtime } from '../../../store/slices/eventSlice';
import ShowtimeItem from './ShowtimeItem';

export default function ShowsInfoForm({ errors, onChange }) {
  const dispatch = useDispatch();
  const shows = useSelector((state) => state.event.event.shows);

  const handleAddShowtime = () => {
    const newShow = {
      _id: `temp_${Date.now()}`,
      name: '',
      startTime: '',
      endTime: '',
      tickets: [],
    };
    dispatch(addShowtime(newShow));
    console.log('Adding new showtime...');
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-lg leading-7 font-semibold">
            Lịch diễn & Vé
          </h2>
        </div>
      </div>
      {errors.shows_general && (
        <p className="text-destructive text-center text-sm">
          {errors.shows_general}
        </p>
      )}
      <div className="space-y-6">
        {shows.length > 0 ? (
          shows.map((show, index) => (
            <ShowtimeItem
              key={show._id || index}
              showData={show}
              showIndex={index}
              onChange={(fieldName) => onChange(index, fieldName)}
              errors={errors.shows?.[index] || {}}
            />
          ))
        ) : (
          <div
            className={`border-border-default rounded-lg border-2 border-dashed py-12 text-center`}
          >
            <p className="text-text-secondary">Chưa có suất diễn nào.</p>
          </div>
        )}
        <div className="w-full text-center">
          <Button onClick={handleAddShowtime}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm suất diễn
          </Button>
        </div>
      </div>
    </div>
  );
}
