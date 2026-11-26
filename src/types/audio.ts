export interface SiteAudio {
  title: string;
  url: string;
}

export interface SanitySiteAudioDoc {
  _id: string;
  enabled?: boolean;
  title?: string;
  audioFile?: {
    asset?: {
      _id: string;
      url?: string;
      originalFilename?: string;
      mimeType?: string;
    };
  };
}
