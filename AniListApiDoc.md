https://docs.anilist.co/guide/graphql/

https://anilist.co/graphiql?query=%7B%0A%20%20Page(page%3A%201%2C%20perPage%3A%2050)%20%7B%0A%20%20%20%20media(type%3A%20ANIME%2C%20status%3A%20FINISHED%2C%20isAdult%3A%20false%2C%20sort%3A%20POPULARITY_DESC)%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20title%20%7B%0A%20%20%20%20%20%20%20%20romaji%2C%20english%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20genres%0A%20%20%20%20%20%20startDate%20%7B%0A%20%20%20%20%20%20%20%20year%0A%20%20%20%20%20%20%20%20month%0A%20%20%20%20%20%20%20%20day%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20popularity%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D

{
  Page(page: 1, perPage: 50) {
    media(type: ANIME, status: FINISHED, isAdult: false, sort: POPULARITY_DESC) {
      id
      title {
        romaji, english
      }
      genres
      startDate {
        year
        month
        day
      }
      popularity
    }
  }
}

