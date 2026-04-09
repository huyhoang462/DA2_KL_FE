import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostComposerModal from '../../components/features/posts/PostComposerModal';
import PostThread from '../../components/features/posts/PostThread';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
  buildImageFromSeed,
  extractArray,
  isApprovedEvent,
  normalizeEventOption,
  normalizePost,
} from '../../components/features/posts/postUtils';
import { getEventsByUserId } from '../../services/eventService';
import {
  createPost,
  deletePost,
  getAllPosts,
} from '../../services/postService';

const PostSkeleton = () => (
  <div className="bg-background-secondary border-border-default animate-pulse rounded-2xl border p-5">
    <div className="flex items-center gap-3">
      <div className="bg-foreground h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <div className="bg-foreground h-3 w-36 rounded" />
        <div className="bg-foreground h-3 w-24 rounded" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="bg-foreground h-3 w-full rounded" />
      <div className="bg-foreground h-3 w-10/12 rounded" />
    </div>
    <div className="bg-foreground mt-4 aspect-video w-full rounded-lg" />
  </div>
);

const PostsPage = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState({
    content: '',
    relatedEventId: '',
    images: [],
  });
  const [composerError, setComposerError] = useState('');

  const {
    data: postsResponse,
    isLoading: isPostsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['organizer-posts', userId],
    queryFn: () =>
      getAllPosts({
        page: 1,
        limit: 50,
        authorId: userId,
        postType: 'event_promotion',
      }),
    enabled: !!userId,
    staleTime: 30000,
  });

  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
    isFetching: isEventsFetching,
    error: eventsError,
  } = useQuery({
    queryKey: ['organizer-events', userId],
    queryFn: () => getEventsByUserId(userId),
    enabled: !!userId,
    staleTime: 60000,
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      closeComposer();
      toast.success('Đăng bài thành công.');
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
    },
    onError: (error) => {
      setComposerError(
        error?.message || 'Không thể đăng bài. Vui lòng thử lại.'
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
    },
    onError: (error) => {
      toast.error(
        error?.message || 'Không thể xóa bài viết. Vui lòng thử lại.'
      );
    },
  });

  const posts = useMemo(() => {
    return extractArray(postsResponse)
      .map(normalizePost)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [postsResponse]);

  const approvedEvents = useMemo(() => {
    return extractArray(eventsResponse)
      .filter((event) => event?.id || event?._id)
      .filter(isApprovedEvent)
      .map(normalizeEventOption);
  }, [eventsResponse]);

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      relatedEventId: '',
      images: [],
    });
  };

  const openComposer = () => {
    setComposerError('');
    setIsComposerOpen(true);
  };

  const handleAddImageToComposer = () => {
    setComposerForm((prev) => ({
      ...prev,
      images: [...prev.images, buildImageFromSeed()].slice(0, 4),
    }));
  };

  const handleCreatePost = () => {
    setComposerError('');

    const trimmedContent = composerForm.content.trim();

    if (trimmedContent.length < POST_CONTENT_MIN_LENGTH) {
      setComposerError(
        `Nội dung phải từ ${POST_CONTENT_MIN_LENGTH} ký tự trở lên.`
      );
      return;
    }

    if (!composerForm.relatedEventId) {
      setComposerError('Vui lòng chọn sự kiện đã duyệt để gắn vào bài viết.');
      return;
    }

    const selectedEvent = approvedEvents.find(
      (event) => event.id === composerForm.relatedEventId
    );

    if (!selectedEvent) {
      setComposerError('Sự kiện đã chọn không hợp lệ hoặc chưa được duyệt.');
      return;
    }

    createPostMutation.mutate({
      content: trimmedContent,
      images: composerForm.images,
      relatedEvent: composerForm.relatedEventId,
      postType: 'event_promotion',
    });
  };

  if (!userId) {
    return (
      <div className="bg-background-secondary border-border-default rounded-2xl border p-8 text-center">
        <h2 className="text-text-primary text-lg font-semibold">
          Không tìm thấy thông tin tài khoản
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Vui lòng đăng nhập lại để quản lý bài đăng.
        </p>
      </div>
    );
  }

  if (isPostsLoading) {
    return (
      <section className="space-y-5">
        <PostSkeleton />
        <PostSkeleton />
      </section>
    );
  }

  if (postsError) {
    return (
      <ErrorDisplay
        title="Không tải được bài đăng"
        message={postsError?.message}
        onRetry={refetchPosts}
        className="rounded-2xl"
      />
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <section
        onClick={openComposer}
        className="bg-background-secondary border-border-default flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm"
      >
        <img
          src={
            user?.avatar ||
            'https://picsum.photos/seed/organizer-avatar/100/100'
          }
          alt={user?.name || 'Organizer'}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="bg-disabled-background text-text-secondary flex-1 rounded-full px-5 py-2.5 text-sm font-medium">
          Chia sẻ thông tin mới về sự kiện của bạn...
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Chưa có bài viết
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            Bạn chưa đăng bài nào cho sự kiện của mình.
          </p>
        </div>
      ) : (
        <PostThread
          posts={posts}
          allPosts={posts}
          currentUser={user}
          feedQueryKey="organizer-posts"
          onDeletePost={(postId) => deletePostMutation.mutateAsync(postId)}
          isDeletingPost={deletePostMutation.isPending}
          showDeletePostAction
        />
      )}

      <PostComposerModal
        isOpen={isComposerOpen}
        title="Tạo bài viết"
        currentUser={user}
        roleLabel="organizer"
        content={composerForm.content}
        onContentChange={(value) =>
          setComposerForm((prev) => ({
            ...prev,
            content: value.slice(0, POST_CONTENT_MAX_LENGTH),
          }))
        }
        contentLabel="Nội dung bài viết"
        contentPlaceholder="Mô tả thông tin cần truyền thông cho sự kiện..."
        contentLengthText={`${composerForm.content.trim().length}/${POST_CONTENT_MAX_LENGTH} ký tự`}
        entityLabel="Sự kiện đã duyệt để quảng bá"
        entityValue={composerForm.relatedEventId}
        onEntityChange={(value) =>
          setComposerForm((prev) => ({
            ...prev,
            relatedEventId: value,
          }))
        }
        entityOptions={approvedEvents.map((event) => ({
          id: event.id,
          label: event.name,
        }))}
        entityLoading={isEventsLoading || isEventsFetching}
        entityLoadingLabel="Đang tải sự kiện..."
        entityEmptyMessage="Hiện chưa có sự kiện đã duyệt để gắn vào bài viết."
        entityError={eventsError?.message || ''}
        images={composerForm.images}
        onAddImage={handleAddImageToComposer}
        onRemoveImage={(index) =>
          setComposerForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, imageIndex) => imageIndex !== index),
          }))
        }
        addImageLabel="Thêm ảnh mẫu"
        error={composerError}
        onClose={closeComposer}
        onSubmit={handleCreatePost}
        isSubmitting={createPostMutation.isPending}
        submitLabel="Đăng bài"
      />

      {(isEventsLoading || isEventsFetching) && isComposerOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs text-white">
          <LoadingSpinner size="sm" className="text-white" />
          Đang tải dữ liệu sự kiện...
        </div>
      )}
    </div>
  );
};

export default PostsPage;
