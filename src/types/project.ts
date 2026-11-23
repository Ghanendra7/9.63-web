export interface Project {
  _id: string;
  _type?: "project";
  title: string;
  client?: string;
  projectNumber?: string;
  slug: { current: string } | string;
  comingSoon?: boolean;
  coverImage: {
    asset: {
      _ref?: string;
      url?: string;
    };
    alt?: string;
  };
  gallery?: Array<{
    asset: {
      _ref?: string;
      url?: string;
    };
    alt?: string;
  }>;
  slideCount?: string;
  year?: string;
  services?: string[];
  gridRow?: number;
  gridCol?: number;
  orderRank: string | number;
}
