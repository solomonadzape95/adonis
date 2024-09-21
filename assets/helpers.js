import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  formatDistance,
} from "date-fns";
export function timeLeft(later) {
  let today = new Date();
  let time = `${differenceInDays(later, today)}D, ${
    differenceInHours(later, today) % 24
  }H, ${differenceInMinutes(later, today) % 60}M ${
    differenceInSeconds(later, today) % 60
  }S`;
  return time;
}
// export async function addLinks(desc, link) {
//   await desc
//     .split(" ")
//     .map((x) => (x = x.startsWith("/") ? `<a href=${link}>${x}</a>` : x));
// }
