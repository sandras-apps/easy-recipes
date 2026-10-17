# Easy Recipes 🐣

A free recipe app with no account and no ads.
Doses are repeated inside every step, and timers are ready right where you need them.

**Try it:** [sandras-apps.github.io/easy-recipes](https://sandras-apps.github.io/easy-recipes/)

## Features

- Recipes from three places: **House recipes** written for the app, **TheMealDB** (with photos)
  and the **Wikibooks Cookbook**. Search by name or by ingredient, browse categories and cuisines, or tap "Surprise me".
- **Doses inside every step**: next to each ingredient mentioned in a step, you see its dose.
  If the step already says how much (e.g. "2 tablespoons of water"), no extra dose is added.
- **Ready-made timers**: every duration in the text ("cook for 5 minutes", "1 to 2 minutes") is a button.
  Up to 15 minutes, tap it and the timer starts in the app. Longer times (a 2-hour rise, an hour in the oven)
  show the clock time to come back at instead, with a reminder to set a phone timer too.
  For ranges like "X to Y", the timer uses the shorter time, so you check early.
- **Units**: switch between the recipe as written, metric (g, ml, °C) and US (oz, lb, cups, °F).
- **Batch size**: ½×, 1×, 1½×, 2× or 3× rescales every dose, including the ones inside the steps.
- **Cook mode**: one step at a time, big text, and the screen stays on.
- **My cookbook**: save recipes with the heart, add your own notes, and use them offline.
- **The chick** welcomes you the first time, suggests recipes, keeps you company when your cookbook is empty
  and celebrates with you when you finish a recipe.
- **Backup**: export your cookbook as a .json file and import it again whenever you like.
- **No photo, no hole**: recipes without a photo get a cosy illustrated placeholder.

## Privacy and permissions

- No account, no email, no tracking.
- No permissions needed. Timers ring and vibrate inside the app only.
- Fonts and images are bundled with the app. The only sites it contacts are TheMealDB and Wikibooks, to fetch recipes.
- Nobody can post recipes in the app: House recipes are added only by the developer, through this repository.
  People can email a recipe; it's published only if the developer chooses it, with the author's name.

## Good to know

- **Timers with a locked phone**: the time stays correct, but the alarm only sounds while the app is open.
  That's why the screen stays on in cook mode, and why long timers suggest a phone timer instead.
  The "come back at" time is read from your phone's clock: no permission needed, nothing leaves your phone.
- **Uninstalling deletes your cookbook**: it's saved on your phone. Use "Export cookbook" first.
- **Data source**: recipes and photos come from [TheMealDB](https://www.themealdb.com) through its free test key "1",
  meant for personal and educational use. The photos belong to the TheMealDB community, not to us.
  Publishing on an app store would require becoming a TheMealDB supporter (paid key).
- **Wikibooks recipes** are read live from [en.wikibooks.org](https://en.wikibooks.org/wiki/Cookbook:Table_of_Contents)
  and reformatted on your phone. Pages with an unusual layout show a link to the original instead.

## Install it on your phone

- **Android (Chrome)**: open the link → ⋮ menu → **Install app** (or "Add to Home screen").
- **iPhone (Safari)**: open the link → Share button → **Add to Home Screen**.

## Host your own copy on GitHub Pages

1. Create a free account on [github.com](https://github.com) if you don't have one.
2. Top right: **+** → **New repository**. Name: `easy-recipes`. Choose **Public** → **Create repository**.
3. On the repository page, click **uploading an existing file**.
   Drag in **the contents** of the `easy-recipes` folder (index.html and the css, js, icons, fonts folders, etc.),
   not the folder itself. Then click **Commit changes**.
   The `.nojekyll` file is hidden: if you can't see it, don't worry, the app works anyway.
4. **Settings** → **Pages** → under "Branch" pick `main` and the `/ (root)` folder → **Save**.
5. After 1–2 minutes the app is live at `https://YOUR-NAME.github.io/easy-recipes/`.

## Adding a House recipe

House recipes live in the `my-recipes` folder, written in [Cooklang](https://cooklang.org/docs/spec/),
a plain-text recipe format: `@ingredient{quantity%unit}` for ingredients and `~{time%unit}` for timers.

1. Upload the new `.cook` file into the `my-recipes` folder on GitHub.
2. Open `my-recipes/index.json`, click the pencil icon and add the file name to the list
   (mind the commas), then **Commit changes**.

```json
{
  "recipes": [
    "pasta-al-pomodoro.cook",
    "my-new-recipe.cook"
  ]
}
```

The recipe shows up in the app within a couple of minutes. To remove one, delete its line from `index.json`.

At the top of each `.cook` file, lines starting with `>>` describe the recipe. Only `title` is needed;
the rest is optional. The author's name appears on the card and page ("Recipe by …"), and the author link
must start with `https://`. Photos go in `my-recipes/photos` (a light `.webp` or `.jpg`, about 1200 px wide).
Lines starting with a single `>` become "Tips & notes".

```
>> title: Nonna's lemon cake
>> author: Maria Rossi
>> author url: https://example.com
>> image: photos/lemon-cake.webp
>> photo by: Maria Rossi
>> servings: 8
>> time: 1 hour
>> cuisine: Italian
>> category: Dessert
>> description: A soft, fragrant cake for Sunday breakfast.

Mix @flour{250%g} and @sugar{200%g}. Bake for ~{40%minutes}.

> Tip: it keeps for 3 days under a glass dome.
```

### Recipes from other people

Users can't post recipes in the app. To let people send you theirs, write your email in `js/app.js`
(`const CONTACT_EMAIL = 'you@example.com';`): a "Send your recipe" button then appears under House recipes
and opens a ready-made email. You decide what to publish. Before publishing, make sure the person agreed,
that the recipe is their own and not copied from a book or website, and which name they want shown.
Leave the email empty (`''`) to hide the button.

## Updating the app

Upload the changed files to GitHub, then in `sw.js` change `er-v9` to `er-v10` (then `er-v11`, and so on),
so phones download the new version.

## Translating the interface

All the app's text lives in one place: the `T` object at the top of `js/app.js`.

## Thank you, TheMealDB and Wikibooks 💛

This app exists thanks to [TheMealDB](https://www.themealdb.com), a free and open recipe database
built by its community. Every recipe and photo in Easy Recipes comes from there,
and the photos belong to their authors, not to us.
If you enjoy the app, pay them a visit and, if you can, [support them](https://www.themealdb.com/api.php).

Many more recipes come from the [Wikibooks Cookbook](https://en.wikibooks.org/wiki/Cookbook:Table_of_Contents),
a free cookbook written by volunteers and shared under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Easy Recipes reformats those pages into steps with doses and timers; every Wikibooks recipe in the app
links back to its original page and its authors.

## About the artwork

The chef chick and the Easy Recipes logo were **AI-generated with Canva AI**, then directed, selected
and edited by Alessandra. The original files, with their Canva content credentials (C2PA metadata),
are in the `design` folder. The images inside the app are lighter, background-free copies of those originals.

## Credits

- Recipes and photos: [TheMealDB](https://www.themealdb.com) and its community
- Recipes: the [Wikibooks Cookbook](https://en.wikibooks.org/wiki/Cookbook:Table_of_Contents) and its contributors (CC BY-SA 4.0)
- House recipe format: [Cooklang](https://cooklang.org)
- Chef chick and logo: Alessandra, made with Canva AI
- Moodboard and art direction: Alessandra
- Fonts: Fredoka and Nunito (SIL Open Font License, see the `fonts` folder)
