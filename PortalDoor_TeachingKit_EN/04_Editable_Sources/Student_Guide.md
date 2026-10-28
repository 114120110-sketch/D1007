# Portal Door | Student Guide

> Place a door on the floor with your phone. The other world is visible only through the doorway. Walk through, and you are inside it. Turn around, and the doorway shows the real world you just left.
>
> **No coding required.** You will only use the Inspector in 8th Wall Desktop, plus your own images and sounds.

<div class="note">Button names may differ slightly between 8th Wall Desktop versions. Follow your instructor's demo.</div>

---

## What you will make

| The viewer… | What happens |
|---|---|
| Scans a QR code and opens the link on their phone | Sees the camera feed and an on-screen hint |
| Points the phone at the floor and taps | A door grows out of the floor and swings open |
| Looks through the doorway | Sees your "other world" (a 360° panorama) |
| Looks from the side or from behind | Sees only a door — nothing else |
| Walks through the doorway | Is surrounded by the other world; your sound plays |
| Turns around to face the door | The doorway shows the real world they just left |

---

## Step 0 | Get ready

- A computer (Mac or Windows) with **8th Wall Desktop** installed (download: 8thwall.org/downloads).
- A phone: Safari on iPhone, Chrome on Android.
- The **Portal Door Teaching Kit** from your instructor. Unzipped, it contains:

```
01_Add_to_your_project/
   src/portal-door.ts                 ← the Portal Door component (no need to open it)
   src/assets/sample-panorama.jpg     ← sample panorama
05_Assets/
   panorama-drawing-template_4096x2048.png
   sample-sound_door-chime.wav
   sample-sound_other-world-ambience.wav
```

---

## Step 1 | Create a new project

1. Open 8th Wall Desktop. From the Hub, create a **new blank project** with a simple name such as `my-portal`.
2. Open the project. You will see the **Space Hierarchy** (object list) on the left, the 3D viewport in the middle, and the **Inspector** (properties) on the right.

## Step 2 | Add the kit to your project

1. Find your project folder on your computer (your instructor will show you how). It contains a `src` folder.
2. Copy **everything inside** the kit's `01_Add_to_your_project/src/` into your project's `src` folder:
    - `portal-door.ts` goes directly in `src/`
    - the `assets` folder goes in `src/` (if `assets` already exists, just copy the image into it)
3. Go back to 8th Wall Desktop. If the new image or the component doesn't show up, close and reopen the project.

<div class="tip">Copying files is the only step outside the editor. Everything else happens in the Inspector.</div>

## Step 3 | Set the camera to AR

1. In the Space Hierarchy, select **Camera**.
2. In the Inspector's camera settings:
    - Camera Type: **World** (world-tracking AR)
    - Phone: **AR**, Desktop: **3D**
3. Set the Camera **Position** to `0, 1.6, 0` and **Rotation** to `0, 0, 0`.
4. (Recommended) If there is a **Near Clip** setting, change it to `0.01` so the image doesn't flicker as you step through the doorway.
5. If the template scene has a purple Box, you can delete it.

## Step 4 | Add the Portal Door

1. In the Space Hierarchy, click **+ Object** and add an **Empty** object. Name it `Portal`.
2. With it selected, click **Add Component** in the Inspector and choose **portal-door**.
3. A list of settings appears in the Inspector. Leave them as they are for now.
4. Open the preview (Simulator) and tap the **lower half of the view (the floor)**. A pink door should appear. Because you haven't chosen a panorama yet, the doorway shows the **sample garden**.

<div class="tip">Use only <b>one</b> portal-door per scene.</div>

## Step 5 | Add your 360° panorama

1. Put your panorama (`.jpg` or `.png`, **2:1 width:height**) in your project's `src/assets/` folder.
2. Select the `Portal` object. In the Inspector:
    - **World | Type**: choose `panorama`
    - **World | 360 panorama**: choose your image from the asset list
3. Preview, tap the floor, and your world appears in the doorway.
4. Wrong view through the doorway? Adjust **World | Panorama rotation**:
    - `0`: the doorway faces the **centre** of the image
    - `90`: the doorway shows the part of the image a **quarter to the right**
    - `-90`: the doorway shows the part a **quarter to the left**
    - `180`: the doorway shows where the left and right edges meet
5. Too dark or too bright? Adjust **World | Panorama brightness** (1 = original).

<div class="tip">Large images are fine: the component automatically shrinks anything wider than 4096 px so phones can handle it.</div>

## Step 6 | Design the door, sound and text

Everything is in the Inspector. See the **Inspector Quick Reference** for what each setting does.

- **Door**: width, height, colour (pick it with the colour picker), open angle (0 = closed).
- **Sound**: put an `.mp3` or `.wav` in `src/assets/`, then choose it in the Inspector.
    - *Crossing sound effect*: plays once as the viewer steps through.
    - *Other-world ambience*: loops while the viewer is inside and stops when they step out.
    - To try it out first, use the two sample sounds in the kit.
- **Text**: rewrite the four on-screen messages. They are part of your piece, too.

## Step 7 | Publish to your phone

Phones only allow camera access on an **https** link.

1. In 8th Wall Desktop, click **Publish → HTML5 → Build**, then download the `.zip`.
2. Unzip it and upload it the way your instructor asks:
    - **Option A | Hand it in**: give the unzipped folder to your instructor, who puts it on the class website and gives you a link.
    - **Option B | Netlify Drop**: go to app.netlify.com/drop and drag the unzipped folder in. You get an https link. Sign up for a free account so the link stays online.
3. Turn the link into a QR code (any QR generator works) and scan it with your phone.
4. The first time you open it, **allow camera access**.

<div class="note">Each time you change a setting in the Inspector, you must Publish and upload again before the phone shows the change.</div>

## Step 8 | Test on site

1. Find an open area of **at least 3 × 3 m** with a **textured floor** (tiles, wood, carpet) and good light. Plain, shiny or dark floors are hard for the phone to track.
2. Point the phone at the floor and move it slowly from side to side for 2–3 seconds, then tap the floor to place the door.
3. Check these four things:
    - ☐ From the front, the doorway shows your panorama
    - ☐ From the side and from behind, the panorama is not visible
    - ☐ Walking through the **middle** of the doorway takes you into the other world
    - ☐ Turning to face the door, the doorway shows the real world
4. Something wrong? Turn on **Advanced | Show debug info**. The top-left corner then shows your phone's position relative to the door:
    - `x`: left/right (0 = centre of the doorway)
    - `z`: front/back (above 0 = in front of the door, below 0 = behind it)
    - To count as entering, `x` must be within the "Doorway" range at the moment you cross.

---

## Troubleshooting

| Problem | Try this |
|---|---|
| portal-door isn't in the component list | Make sure `portal-door.ts` is in `src/` (not `src/assets/`), then reopen the project |
| Black screen, no camera | The link must be https; allow camera access for the browser in your phone settings |
| "Tap on the floor" keeps appearing | Aim lower, at the floor; don't place it too far away (see *Max placement distance*); check the camera type is World |
| The door drifts around | Move somewhere brighter with a textured floor; sweep the phone side to side before placing |
| I see the garden, not my panorama | Set *World \| Type* to `panorama` and choose your image |
| "Could not load the panorama" | Use .jpg or .png; give the file a name with only letters and numbers |
| The panorama looks distorted or has a seam | The image isn't 2:1, or the left and right edges of your drawing don't match |
| Walking through the doorway doesn't switch | Walk slowly through the middle; or lower *Doorway margin* (e.g. 0.1) |
| Walking past the side also switches | Raise *Doorway margin* (e.g. 0.25) |
| No sound | On iPhone, turn off the silent switch; sound only starts after you tap to place the door |
| The phone doesn't show my changes | Publish and upload again, then refresh the page on the phone |
