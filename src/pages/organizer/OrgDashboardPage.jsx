import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getEventById } from '../../services/eventService';

const OrgDashboardPage = () => {
  const { id } = useParams();

  // Trang con cũng gọi useQuery với CÙNG MỘT queryKey
  const { data: event, isLoading } = useQuery({
    queryKey: ['eventDetail', id],
    queryFn: () => getEventById(id),
  });
  return <>My order</>;
};
export default OrgDashboardPage;
