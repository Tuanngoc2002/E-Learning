export interface Image {
  data: {
    attributes: {
      url: string;
    };
  };
}

export interface Category {
  id: number;
  documentId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Instructor {
  id: string;
  attributes: {
    name: string;
    bio: string;
    avatar: Image;
    courses?: {
      data: Course[];
    };
  };
}

export interface Course {
  id: string;
  attributes: {
    title: string;
    description: string;
    price: number;
    image: Image;
    category: {
      data: Category;
    };
    instructor: {
      data: Instructor;
    };
  };
}

export interface Testimonial {
  id: string;
  attributes: {
    name: string;
    role: string;
    content: string;
    avatar: Image;
  };
}

export * from './auth'
export * from './course' 