import { useQuery } from '@apollo/client';
import { CATEGORY_QUERIES } from '@/services/category.service';
import { Category } from '@/types';

export const useCategories = () => {
  const { loading, error, data } = useQuery(CATEGORY_QUERIES.GET_ALL);
  return { 
    loading, 
    error, 
    categories: (data?.categories?.data || []) as Category[] 
  };
};

export const useCategoryBySlug = (slug: string) => {
  const { loading, error, data } = useQuery(CATEGORY_QUERIES.GET_BY_SLUG, {
    variables: { slug },
    skip: !slug
  });
  return { 
    loading, 
    error, 
    category: data?.categories?.data[0] as Category | null 
  };
}; 