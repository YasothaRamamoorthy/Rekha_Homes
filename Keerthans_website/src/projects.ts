export interface ProjectImage {
  url: string;
  alt: string;
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'wide';
}

export interface Project {
  id: string;
  title: string;
  images: ProjectImage[];
}

const asset = (filename: string, aspectRatio: ProjectImage['aspectRatio'] = 'portrait'): ProjectImage => ({
  url: `${import.meta.env.BASE_URL}assets/${filename}`,
  alt: 'RehkaHomes project photography',
  aspectRatio,
});

export const PROJECTS: Project[] = [
  {
    id: 'project-01',
    title: 'Project 01',
    images: [
      asset('image-01.jpeg', 'landscape'),
      asset('image-02.jpeg'),
      asset('image-03.jpeg'),
      asset('image-04.jpeg'),
      asset('image-05.jpeg'),
      asset('image-06.jpeg'),
      asset('image-07.jpeg'),
      asset('image-08.jpeg'),
      asset('image-09.jpeg'),
      asset('image-10.jpeg', 'landscape'),
      asset('image-11.jpeg','landscape'),
      asset('image-12.jpeg'),
      asset('image-13.jpeg'),
      asset('image-14.jpeg'),
      asset('image-15.jpeg'),
      asset('image-16.jpeg'),
      asset('image-17.jpeg'),
      asset('image-18.jpeg'),
      asset('image-19.jpeg'),
      asset('image-20.jpeg'),
      asset('image-21.jpeg'),
      asset('image-22.jpeg'),
      asset('image-23.jpeg', 'landscape'),
      asset('image-24.jpeg'),
      asset('image-25.jpeg'),
      asset('image-26.jpeg'),
      asset('image-27.jpeg'),
      asset('image-28.jpeg'),
      asset('image-29.jpeg'),
      asset('image-30.jpeg'),
      asset('image-31.jpeg'),
      asset('image-32.jpeg'),
      asset('image-33.jpeg'),
      asset('image-34.jpeg'),
      asset('image-35.jpeg'),
      asset('image-36.jpeg'),
      asset('image-37.jpeg'),
      asset('image-38.jpeg'),
      asset('image-39.jpeg'),
    ],
  },
];
