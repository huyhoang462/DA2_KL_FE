import { Calendar, Clock, Eye, MapPin, User } from 'lucide-react';
import Button from '../../ui/Button';

const EventListItem = ({ event, onViewDetails }) => (
  <div className="bg-background-secondary border-border-default rounded-lg border p-6">
    <div className="flex items-start gap-4">
      <img
        src={event.bannerImageUrl || '/api/placeholder/300/200'}
        alt={event.name}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-text-primary truncate text-lg font-semibold">
              {event.name}
            </h3>
            <div className="text-text-secondary mt-2 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event.startDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location.address}</span>
              </div>
            </div>
            <div className="text-text-secondary mt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{event.creator?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(event.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => onViewDetails(event.id)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default EventListItem;
