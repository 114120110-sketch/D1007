# Portal Door | Inspector Quick Reference

Select the object that has the **portal-door** component. All of these settings are in the Inspector.

## Door

| Setting | Default | What it does |
|---|---|---|
| Door \| Width (m) | 1.3 | Width of the doorway. If it's too narrow, viewers find it hard to walk "through the doorway" |
| Door \| Height (m) | 2.7 | Taller than eye level makes the door feel walk-through-able |
| Door \| Colour | pink | Click it and pick a colour with the colour picker |
| Door \| Open angle (deg) | 105 | 0 = closed (viewers can only imagine what's behind it); 170 = almost fully open |

## World

| Setting | Default | What it does |
|---|---|---|
| World \| Type | panorama | `panorama` = your 360° image; `garden` = the sample garden |
| World \| 360 panorama | (empty) | Choose a 2:1 panorama from your assets. If empty, the sample garden is shown |
| World \| Panorama rotation (deg) | 0 | 0 = the doorway faces the centre of the image; 90 = turn right; -90 = turn left |
| World \| Panorama brightness | 1 | 0.2–2. 1 = original brightness |

## Sound (optional)

| Setting | Default | What it does |
|---|---|---|
| Sound \| Crossing sound effect | (empty) | Plays once as the viewer steps through the doorway |
| Sound \| Other-world ambience | (empty) | Loops while the viewer is inside; stops when they step out |
| Sound \| Volume | 0.8 | 0–1 |

## Text

| Setting | When it appears |
|---|---|
| Text \| Before placing | When the page first opens |
| Text \| After placing | After the door appears |
| Text \| On entering | When the viewer steps through the doorway |
| Text \| On returning | When the viewer steps back out |

Leave a field empty to show no text at that moment.

## Advanced

| Setting | Default | What it does |
|---|---|---|
| Advanced \| Max placement distance (m) | 8 | Taps on the floor further away than this don't place the door |
| Advanced \| Doorway margin (m) | 0.15 | How far in from each side of the doorway the viewer must pass to count as entering. Larger = stricter |
| Advanced \| Show debug info | off | Shows the phone's position relative to the door in the top-left corner. You can also add `?debug=1` to the end of the link |

---

## Panorama cheat sheet

- The image must be **2:1 (width:height)**, e.g. 4096×2048 or 8000×4000.
- The **centre** of the image = straight through the doorway. The **left and right edges** = behind you; they join up.
- The **horizontal centre line** = eye level (the horizon).
- The top row shrinks to a single point overhead; the bottom row shrinks to a point under your feet. Keep important things near the middle band.
- For hand-drawn panoramas, use the kit's **panorama drawing template**.
