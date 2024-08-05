export type TEvent = {
  id: number;
  name: string;
  description: string;
  startsOn: string;
  endsOn: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  country: string;
  postalCode: string;
  region: string;
  placeName: string;
  ticketUrl: string | null;
  complement: string;
  instagramUsername: string;
  phoneNumber: string;
  geoLocation: string;
  media: {
    id: number;
    type: string;
    fileName: string;
    url: string;
  }[];
  categories: string[];
  tags: string[];
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    nickname: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: number;
  distanceKm: number;
  _esMeta: {
    sort: [number, string];
  };
  score: number;
};

export type RelevanceFilterItem = {
  title: string;
  key: "recent" | "nearest" | "preferencias";
  isActive: boolean;
};
