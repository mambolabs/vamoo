import { AD_STEP } from "~/constants";
import type { TEvent } from "~/types";


// https://api.vamoo.la/v1/events?toDate=2024-08-19T11:22:36.871&geoLocation=0,0&distance=1km
// https://api.vamoo.la/v1/events?toDate=2024-08-19T11:22:36.871&geoLocation=-1.28419,36.81559&distance=1km
// https://api.vamoo.la/v1/events?search_after%5B%5D=0.0793509&search_after%5B%5D=1102&toDate=2024-08-19T11:22:36.871&geoLocation=-1.28419,36.81559&distance=1km
// https://api.vamoo.la/v1/events?search_after%5B%5D=0.05713117&search_after%5B%5D=1100&toDate=2024-08-19T11:22:36.871&geoLocation=-1.28419,36.81559&distance=1km

//NO location
// https://api.vamoo.la/v1/events?toDate=2024-08-19T11:22:36.871&geoLocation=0,0&distance=1km

//Response
// {
//   "type": "SUCCESS",
//   "details": {
//       "results": [
//           {
//               "id": 1242,
//               "name": "Arnaldo Antunes @ Pedreira Paulo Leminski",
//               "description": "O Festival Paulo Leminski reunirá manifestações artísticas de diversos gêneros para representar a diversidade e genialidade da obra de Paulo Leminski. Entre as atrações estão uma feira literária, recitais de poesia e slam, performances artísticas e apresentações musicais de parceiros e intérpretes musicais do homenageado, na Pedreira Paulo Leminski, no dia 24/08/2024, data que ele faria 80 anos. O evento foi concebido para marcar a efeméride e fazer uma conexão da cultura brasileira com a produção do artista curitibano.",
//               "startsOn": "2024-08-24T15:00:00.000Z",
//               "endsOn": "2024-08-24T23:00:00.000Z",
//               "city": "Curitiba",
//               "neighborhood": "Abranches",
//               "address": "Rua João Gava, 970, Abranches",
//               "number": "970",
//               "country": "BR",
//               "postalCode": "82130-010",
//               "region": "PR",
//               "placeName": "Pedreira Paulo Leminski",
//               "ticketUrl": "https://shotgun.live/events/festival-paulo-leminski",
//               "complement": "🍏",
//               "instagramUsername": "@vamoola",
//               "phoneNumber": "41996609651",
//               "geoLocation": "-25.3842233,-49.277570800000035",
//               "media": [
//                   {
//                       "id": 992,
//                       "type": "image",
//                       "fileName": "a2c7ade6-29e6-403d-b7c6-24db527c310c.png",
//                       "url": "https://media.vamoo.la/events/1242/media/992/a2c7ade6-29e6-403d-b7c6-24db527c310c.png"
//                   },
//                   {
//                       "id": 993,
//                       "type": "image",
//                       "fileName": "541683de-48fd-466c-8b3b-60b6e3c5bf0e.jpeg",
//                       "url": "https://media.vamoo.la/events/1242/media/993/541683de-48fd-466c-8b3b-60b6e3c5bf0e.jpeg"
//                   }
//               ],
//               "categories": [
//                   "musical"
//               ],
//               "tags": [
//                   "mbp",
//                   "rockbrasileiro",
//                   "rock"
//               ],
//               "user": {
//                   "id": 1,
//                   "email": "vamoo.la.email@gmail.com",
//                   "firstName": "Vamoo",
//                   "lastName": "La",
//                   "nickname": "vamoo.la",
//                   "createdAt": "2023-05-22T23:05:00.000Z",
//                   "updatedAt": "2023-05-22T23:05:00.000Z"
//               },
//               "createdAt": "2024-07-13T12:40:29.000Z",
//               "updatedAt": "2024-07-13T12:44:23.000Z",
//               "userId": 1,
//               "distanceKm": 5991.444721219166,
//               "_esMeta": {
//                   "sort": [
//                       0.085588686,
//                       "1242"
//                   ]
//               },
//               "score": 9
//           },
//           {
//               "id": 1181,
//               "name": "Zeca Pagodinho @ Expotrade Convention Center",
//               "description": "Zeca Pagodinho @ Expotrade Convention Center",
//               "startsOn": "2024-08-24T18:30:00.000Z",
//               "endsOn": "2024-08-25T02:30:00.000Z",
//               "city": "Pinhais",
//               "neighborhood": "Vila Amelia",
//               "address": "Rod. Dep. João Leopoldo Jacomel, 10454",
//               "number": "10454",
//               "country": "BR",
//               "postalCode": "83320-005",
//               "region": "PR",
//               "placeName": "Expotrade Convention Center",
//               "ticketUrl": "https://www.ticket360.com.br/ingressos/28430/ingressos-para-zeca-pagodinho-40-anos-em-curitiba?utm_medium=cpc&utm_campaign=bandsintown&utm_id=ticket360",
//               "complement": "🍊",
//               "instagramUsername": "@vamoola",
//               "phoneNumber": "41996609651",
//               "geoLocation": "-25.4344203,-49.1668703",
//               "media": [
//                   {
//                       "id": 943,
//                       "type": "image",
//                       "fileName": "5c6d1265-8585-405a-bce2-bfb4fc03c051.jpeg",
//                       "url": "https://media.vamoo.la/events/1181/media/943/5c6d1265-8585-405a-bce2-bfb4fc03c051.jpeg"
//                   }
//               ],
//               "categories": [
//                   "musical"
//               ],
//               "tags": [
//                   "pop",
//                   "zecapagodinho",
//                   "samba",
//                   "pagode",
//                   "riodejaneiro",
//                   "acsticomtv",
//                   "partidoalto",
//                   "grammy"
//               ],
//               "user": {
//                   "id": 1,
//                   "email": "vamoo.la.email@gmail.com",
//                   "firstName": "Vamoo",
//                   "lastName": "La",
//                   "nickname": "vamoo.la",
//                   "createdAt": "2023-05-22T23:05:00.000Z",
//                   "updatedAt": "2023-05-22T23:05:00.000Z"
//               },
//               "createdAt": "2024-06-28T09:21:04.000Z",
//               "updatedAt": "2024-07-03T10:52:27.000Z",
//               "userId": 1,
//               "distanceKm": 5982.954975829647,
//               "_esMeta": {
//                   "sort": [
//                       0.08544137,
//                       "1181"
//                   ]
//               },
//               "score": 9
//           },
//           {
//               "id": 711,
//               "name": "Zeca Pagodinho @ Expotrade Convention Center",
//               "description": "Zeca Pagodinho @ Expotrade Convention Center",
//               "startsOn": "2024-08-24T20:00:00.000Z",
//               "endsOn": "2024-08-25T04:00:00.000Z",
//               "city": "Pinhais",
//               "neighborhood": "Vila Amelia",
//               "address": "Rod. Dep. João Leopoldo Jacomel, 10454",
//               "number": "10454",
//               "country": "BR",
//               "postalCode": "83320-005",
//               "region": "PR",
//               "placeName": "Expotrade Convention Center",
//               "ticketUrl": "https://www.ticket360.com.br/ingressos/28430/ingressos-para-zeca-pagodinho-40-anos-em-curitiba?utm_medium=cpc&utm_campaign=bandsintown&utm_id=ticket360",
//               "complement": "🍊",
//               "instagramUsername": "@vamoola",
//               "phoneNumber": "41996609651",
//               "geoLocation": "-25.4344203,-49.1668703",
//               "media": [
//                   {
//                       "id": 831,
//                       "type": "image",
//                       "fileName": "747b5930-e547-4d93-a9a7-adb7895aa9da.jpeg",
//                       "url": "https://media.vamoo.la/events/711/media/831/747b5930-e547-4d93-a9a7-adb7895aa9da.jpeg"
//                   }
//               ],
//               "categories": [
//                   "musical"
//               ],
//               "tags": [
//                   "pop",
//                   "zecapagodinho",
//                   "samba",
//                   "acsticomtv",
//                   "pagode",
//                   "riodejaneiro",
//                   "partidoalto",
//                   "grammy"
//               ],
//               "user": {
//                   "id": 1,
//                   "email": "vamoo.la.email@gmail.com",
//                   "firstName": "Vamoo",
//                   "lastName": "La",
//                   "nickname": "vamoo.la",
//                   "createdAt": "2023-05-22T23:05:00.000Z",
//                   "updatedAt": "2023-05-22T23:05:00.000Z"
//               },
//               "createdAt": "2024-04-10T11:19:53.000Z",
//               "updatedAt": "2024-05-07T09:58:00.000Z",
//               "userId": 1,
//               "distanceKm": 5982.954975829647,
//               "_esMeta": {
//                   "sort": [
//                       0.085378245,
//                       "711"
//                   ]
//               },
//               "score": 9
//           },
//           {
//               "id": 1241,
//               "name": "BANDA SOFA @ YouRock Bar",
//               "description": "Show de uma hora da banda SOFA, somente de músicas autorais no palco aberto no YOU BAR.",
//               "startsOn": "2024-08-25T16:00:00.000Z",
//               "endsOn": "2024-08-26T00:00:00.000Z",
//               "city": "Curitiba",
//               "neighborhood": "Rebouças",
//               "address": "R. Piquiri, 390",
//               "number": "390",
//               "country": "BR",
//               "postalCode": "80230-140",
//               "region": "PR",
//               "placeName": "YouRock Bar",
//               "ticketUrl": null,
//               "complement": "🍊",
//               "instagramUsername": "@vamoola",
//               "phoneNumber": "41996609651",
//               "geoLocation": "-25.44484780000001,-49.2610999",
//               "media": [
//                   {
//                       "id": 990,
//                       "type": "image",
//                       "fileName": "08998efc-e9d4-4abf-ae2b-566d9c6a4d07.jpeg",
//                       "url": "https://media.vamoo.la/events/1241/media/990/08998efc-e9d4-4abf-ae2b-566d9c6a4d07.jpeg"
//                   },
//                   {
//                       "id": 991,
//                       "type": "image",
//                       "fileName": "10007abb-e6c5-47f4-9c92-6819e125eae5.jpeg",
//                       "url": "https://media.vamoo.la/events/1241/media/991/10007abb-e6c5-47f4-9c92-6819e125eae5.jpeg"
//                   }
//               ],
//               "categories": [
//                   "musical"
//               ],
//               "tags": [
//                   "indierock",
//                   "bandasofa",
//                   "yourockbar",
//                   "sofaband",
//                   "musicaautoral",
//                   "palcoaberto",
//                   "youbar"
//               ],
//               "user": {
//                   "id": 1,
//                   "email": "vamoo.la.email@gmail.com",
//                   "firstName": "Vamoo",
//                   "lastName": "La",
//                   "nickname": "vamoo.la",
//                   "createdAt": "2023-05-22T23:05:00.000Z",
//                   "updatedAt": "2023-05-22T23:05:00.000Z"
//               },
//               "createdAt": "2024-07-13T12:39:50.000Z",
//               "updatedAt": "2024-07-13T12:44:27.000Z",
//               "userId": 1,
//               "distanceKm": 5992.229672843072,
//               "_esMeta": {
//                   "sort": [
//                       0.08453649,
//                       "1241"
//                   ]
//               },
//               "score": 8
//           },
//           {
//               "id": 1102,
//               "name": "Angra @ Ópera de Arame - Parque das Pedreiras",
//               "description": "Angra @ Ópera de Arame - Parque das Pedreiras",
//               "startsOn": "2024-08-30T19:00:00.000Z",
//               "endsOn": "2024-08-31T03:00:00.000Z",
//               "city": "Curitiba",
//               "neighborhood": "Pilarzinho",
//               "address": "R. João Gava, s/n",
//               "number": "s/n",
//               "country": "BR",
//               "postalCode": "82130-010",
//               "region": "PR",
//               "placeName": "Ópera de Arame - Parque das Pedreiras",
//               "ticketUrl": null,
//               "complement": "🍊",
//               "instagramUsername": "@vamoola",
//               "phoneNumber": "41996609651",
//               "geoLocation": "-25.38452419999999,-49.2761692",
//               "media": [
//                   {
//                       "id": 908,
//                       "type": "image",
//                       "fileName": "4586e49a-a5c3-4c7d-991a-83553b8c838c.jpeg",
//                       "url": "https://media.vamoo.la/events/1102/media/908/4586e49a-a5c3-4c7d-991a-83553b8c838c.jpeg"
//                   }
//               ],
//               "categories": [
//                   "musical"
//               ],
//               "tags": [
//                   "powermetal",
//                   "progressivemetal",
//                   "heavymetal"
//               ],
//               "user": {
//                   "id": 1,
//                   "email": "vamoo.la.email@gmail.com",
//                   "firstName": "Vamoo",
//                   "lastName": "La",
//                   "nickname": "vamoo.la",
//                   "createdAt": "2023-05-22T23:05:00.000Z",
//                   "updatedAt": "2023-05-22T23:05:00.000Z"
//               },
//               "createdAt": "2024-05-17T10:29:19.000Z",
//               "updatedAt": "2024-05-17T10:33:58.000Z",
//               "userId": 1,
//               "distanceKm": 5991.324214637282,
//               "_esMeta": {
//                   "sort": [
//                       0.079359725,
//                       "1102"
//                   ]
//               },
//               "score": 8
//           }
//       ]
//   }
// }
export async function fetchEvents(url: URL) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return [] as TEvent[];
    }

    const data = await response.json();

    return data.details.results as TEvent[];
  } catch (err) {
    console.log(err);

    return [] as TEvent[];
  }
}

export function canShowAds(index: number) {
  if (index === 0) {
    return false;
  }

  return (index + 1) % AD_STEP === 0;
}

export function getDistanceKm(distance: number) {
  return distance / 1000;
}
