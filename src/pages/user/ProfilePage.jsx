import ChangePasswordSection from '../../components/features/auth/ChangePasswordSection';
import ProfileSection from '../../components/features/auth/ProfileSection';
const ProfilePage = () => {
  return (
    <div className="mx-auto">
      <ProfileSection />
      <ChangePasswordSection />
    </div>
  );
};

export default ProfilePage;
