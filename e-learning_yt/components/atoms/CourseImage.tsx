// import React from 'react';
// import Image from 'next/image';
// import { Course } from '@/types/course';

// interface CourseImageProps {
//   course: Course;
//   className?: string;
//   showPrice?: boolean;
// }

// export const CourseImage = ({ course, className = '', showPrice = true }: CourseImageProps) => {
//   return (
//     <div className={`relative h-48 ${className}`}>
//       <Image
//         src={course.image}
//         alt={course.title}
//         fill
//         className="object-cover"
//       />
//       {showPrice && (
//         <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-sm font-semibold">
//           ${course.price}
//         </div>
//       )}
//     </div>
//   );
// }; 