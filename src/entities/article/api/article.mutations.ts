'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi } from './article.api';
import { articleKeys, bookmarkKeys } from './article.queries';

export function useToggleBookmark(articleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => articleApi.changeBookmarkState({ articleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(articleId) });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
  });
}
