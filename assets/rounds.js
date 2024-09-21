const URL = "https://rounds.wtf/api/public/v1";
export async function fetchRounds(id) {
  const res = await fetch(`${URL}/rounds/${id}`);
  const text = await res.json();
  return text;
}
// Response
// {
//   "id": 130,
//   "name": "Base Builds by Rounds.wtf",
//   "slug": "base-builds-by-roundswtf-1",
//   "description": "Base Builds by Rounds.wtf is rewarding Base builders. From Friday to Monday, share a post in /base-builds that starts with \"This week I built\" to earn your share of 2 ETH.",
//   "address": "0x5d3E4c7202B30c719d1bab85cC45407963f966e2",
//   "contractVersion": "SINGLE_ROUND_V1",
//   "status": "complete",
//   "feeEnabled": false,
//   "communityId": 23,
//   "allowlistId": 30,
//   "chainId": 8453,
//   "startsAt": "2024-05-31T05:00:00.000Z",
//   "votingStartsAt": "2024-05-31T17:00:00.000Z",
//   "votingEndsAt": "2024-06-03T17:00:00.000Z",
//   "areWinnersReported": true,
//   "isClaimable": true,
//   "castHash": null,
//   "createdAt": "2024-05-31T12:11:26.000Z",
//   "mods": [
//     "0xd8EF18493b795970a986E6D00CC451f0D6A9B17A"
//   ],
//   "awardAmount": "2",
//   "award": {
//     "assetType": "ETH",
//     "tokenAddress": null,
//     "tokenId": null
//   }
// }
// {
//       "id": 666,
//       "name": "Based Singapore by Rounds",
//       "slug": "based-singapore-by-rounds-1",
//       "description": "The Base community is gearing up for Token2049 this week in Singapore. If you’re there, capture your favorite moments. If you aren’t, create a video showing how the Base community thrives in your local community. Post it on TikTok, Instagram, YouTube, or X, and share the link in the /base-creators channel between Sep 17-24 for a chance to win a share of the 1 ETH prize pool via rounds.wtf",
//       "address": "0xcFbfAc766c9242BEFb9d3E06B42B00b8191fa22b",
//       "contractVersion": "SINGLE_ROUND_V2",
//       "status": "active",
//       "feeEnabled": true,
//       "communityId": 78,
//       "allowlistId": 378,
//       "chainId": 8453,
//       "startsAt": "2024-09-17T15:00:00.000Z",
//       "votingStartsAt": "2024-09-17T15:00:00.000Z",
//       "votingEndsAt": "2024-09-24T15:00:00.000Z",
//       "areWinnersReported": false,
//       "isClaimable": false,
//       "castHash": null,
//       "createdAt": "2024-09-17T15:44:36.000Z",
//       "mods": [
//         "0x2f21f94e1e57543f4663B722b6B1Bed97C576Bd4",
//         "0xf894507c45e0491e27d38c71C1b2FE634820a4db",
//         "0xd8EF18493b795970a986E6D00CC451f0D6A9B17A"
//       ],
//       "awardAmount": "1",
//       "award": {
//         "assetType": "ETH",
//         "tokenAddress": null,
//         "tokenId": null
//       }
//     },
