import { useQuery } from '@apollo/client';
import { TESTIMONIAL_QUERIES } from '@/services/testimonial.service';
import { Testimonial } from '@/types';

export const useTestimonials = () => {
  const { loading, error, data } = useQuery(TESTIMONIAL_QUERIES.GET_ALL);
  return { 
    loading, 
    error, 
    testimonials: (data?.testimonials?.data || []) as Testimonial[] 
  };
}; 