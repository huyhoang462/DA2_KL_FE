
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// import { eventService } from '../../services/eventService';

import EventDescription from '../../components/features/event/EventDescription';
import EventOrganizerInfo from '../../components/features/event/EventOrganizerInfo';
import ErrorDisplay from '../../components/ui/ErrorDisplay'; 
import BigTicket from '../../components/features/event/BigTicket';
import ShowtimeList from '../../components/features/event/ShowtimeList'

export default function EventDetailPage() {
  const { id } = useParams();

  // Dữ liệu giả, thay bằng useQuery
  const event = {
    id: '123',
    name: 'Đại nhạc hội Mùa hè 2024',
    bannerImageUrl: 'https://res.cloudinary.com/demo/image/upload/docs/models.jpg',
    startDate: '2024-08-15T19:00:00.000Z',
    endDate: '2024-08-15T23:00:00.000Z',
    location: { address: 'Sân vận động Mỹ Đình, Hà Nội' },
    description: '<h2>Mô tả sự kiện</h2><p>Đây là một sự kiện âm nhạc hoành tráng...</p>',
    organizer: { name: 'Shine Entertainment',email:"h@gmail.com", phone:"0123698547", description: 'Nhà tổ chức sự kiện hàng đầu...' },
    shows: [
      { 
        _id: 'show1', 
        name: 'Suất diễn 1',
       startTime: '2024-08-15T19:00:00.000Z',
    endTime: '2024-08-15T23:00:00.000Z',
        tickets: [
          { _id: 't1', name: 'Vé VIP', price: 1000000, description: 'Quyền lợi VIP...' },
          { _id: 't2', name: 'Vé Thường', price: 500000, description: 'Vé vào cửa...' },
        ]
      },
       { 
        _id: 'show2', 
        name: 'Suất diễn 2',
         startTime: '2024-08-15T19:00:00.000Z',
    endTime: '2024-08-15T23:00:00.000Z',
        tickets: [
          { _id: 't3', name: 'Vé VIP', price: 1000000, description: 'Quyền lợi VIP...' },
          { _id: 't4', name: 'Vé Thường', price: 500000, description: 'Vé vào cửa...' },
        ]
      }
    ]
  };
  const isLoading = false;
  const isError = false;
  const error = null;

  /*
  // --- BẠN SẼ DÙNG useQuery THẬT Ở ĐÂY ---
  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
  });
  */
  
  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading</div>;
  if (isError) return <ErrorDisplay message={error.message} />;
  if (!event) return <ErrorDisplay message="Không tìm thấy sự kiện." />;

  return (
    <div className="bg-background-primary min-h-screen text-text-primary">
      
      <div className=" mx-auto ">
        <div className="grid grid-cols-1 space-y-8  mb-10">
          
            <BigTicket event={event}/>
            <EventDescription description={event.description} />
            <EventOrganizerInfo organizer={event.organizer}/>

            <div className="sticky top-20 space-y-6">
              <h2 className="text-xl font-bold">Chọn vé của bạn</h2>
              <ShowtimeList shows={event.shows}/>
            </div>

        </div>
      </div>
    </div>
  );
}