export interface ProjectImageHotspot {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface ProjectImageCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ProjectImage {
  _key?: string;
  _type?: string;
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
        aspectRatio?: number;
      };
    };
  };
  hotspot?: ProjectImageHotspot;
  crop?: ProjectImageCrop;
  focalPoint?: string;
  alt?: string;
}

export interface Project {
  _id: string;
  _type?: "project";
  title: string;
  client?: string;
  projectNumber?: string;
  slug?: { current: string } | string;
  comingSoon?: boolean;
  images?: ProjectImage[];
  coverImage?: ProjectImage;
  gallery?: ProjectImage[];
  slideCount?: string;
  year?: string;
  services?: string[];
  gridRow?: number;
  gridCol?: number;
  orderRank: string | number;
}
