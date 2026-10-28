# Portal Door | Instructor Handbook

**Course title**: Crossing the Threshold — Creating an "Other World" with WebAR
**Audience**: Digital media students (no programming required)
**Duration**: 8 hours in 4 units of 2 hours each — run it as 4 weekly 2-hour sessions or 2 days of 4 hours.
**Tools**: 8th Wall Desktop (open source), a phone browser, any drawing or image-editing software
**No coding**: every creative decision is made by adjusting settings in the Inspector and adding the students' own images and sounds.

---

## Learning outcomes

By the end of the course, students will be able to:

1. Explain the difference between AR and VR, and the meaning of the *threshold* as a device for spatial storytelling.
2. Understand how a 360° panorama (equirectangular projection) is composed, and produce one of their own.
3. Build a WebAR piece in 8th Wall Desktop using only the Inspector, and experience it on a phone.
4. Design the visuals, sound and text around three moments of the viewer's experience: **seeing, crossing, looking back**.
5. Publish, test and exhibit the piece in a real space, and give peer feedback.

---

## Preparation (instructor)

### One week before

- [ ] On your own computer, start from a **brand-new blank project** and follow the Student Guide from start to finish. Take **screenshots** of each step in your version of 8th Wall Desktop and add them to the handouts, because button names can differ between versions.
- [ ] Publish your finished example to an https link and make a QR code for the opening activity.
- [ ] Check that students can install 8th Wall Desktop (macOS on Apple Silicon or Intel, or Windows). In a computer lab, ask IT to install it in advance.
- [ ] Choose how students will publish (pick one):
  - **Option A | Class website (recommended)**: create one GitHub Pages repository and put each student's build in its own folder, e.g. `/student01/`. The kit uses relative paths, so builds work in sub-folders. Students don't need any accounts.
  - **Option B | Netlify Drop**: students drag their build folder to app.netlify.com/drop. Ask them to sign up for a free account so their links stay online.

### On the day

- [ ] Find an open area of at least 3 × 3 m with a textured floor (tiles, wood, carpet) and good light. Avoid plain, shiny or dark floors.
- [ ] Ask students to scan the example QR code to check their phone can open the camera (Safari on iPhone, Chrome on Android).
- [ ] Have the kit ready to share (USB drive or cloud link).
- [ ] Backup: 2–3 tested phones for students whose devices don't cooperate.

---

## Unit 1 | Threshold: the door and the other world (2 h)

**Goal**: experience the piece, understand the concept and the principle, and see a first door in their own project.

| Time | Activity | Notes |
|---|---|---|
| 0:00–0:15 | **Opening experience** | Students scan the QR code, place the door, look from the side, walk through and turn around. Let them experience it before explaining anything. |
| 0:15–0:35 | **Talk: thresholds** | The door as an "in-between" (liminal) space; AR (adds to the real world) vs. VR (replaces it); the three moments of this piece: **seeing, crossing, looking back**. Ask students to share a door that matters to them. |
| 0:35–0:50 | **Principle: the invisible wall** | Explain with metaphors, not code (see *Explaining the principle*). Optional cardboard-box demo. |
| 0:50–1:50 | **Hands-on** | Student Guide steps 1–4: create a project, add the kit, set up the camera, add the component, place a door in the preview. Fast finishers change the door's colour and size. |
| 1:50–2:00 | **Homework** | Fill in questions 1–2 of the Project Planning Sheet; start collecting or imagining a panorama. |

**Common sticking points**: can't find the project folder; `portal-door.ts` copied into `src/assets` by mistake; camera not set to World.

---

## Unit 2 | The other world: 360° panoramas (2 h)

**Goal**: understand how a panorama is composed, then make one and put it in the piece.

| Time | Activity | Notes |
|---|---|---|
| 0:00–0:20 | **Talk: flattening a sphere** | Use a world map as the analogy: a globe flattened into a rectangle, stretched more and more towards the poles. Use the panorama drawing template to show that the centre is straight through the doorway, the left and right edges are behind you, and the horizontal centre line is eye level. |
| 0:20–0:35 | **Where panoramas come from** | ① A 360° camera (e.g. Insta360, RICOH THETA) ② phone panorama capture (check that the output is 2:1) ③ hand-drawn or collaged on the template ④ AI-generated 360° images. Discuss: what do real, remembered and imagined places each bring? |
| 0:35–1:35 | **Make the panorama** | Students use their chosen method. Remind those drawing by hand to keep key elements in the middle band and make the left and right edges join up. |
| 1:35–2:00 | **Put it in the piece** | Student Guide step 5: add it to `src/assets/`, choose it in the Inspector, adjust rotation and brightness, and check the doorway view in the preview. |

**Tip**: have students try the sample panorama first. Once that works, switching to their own image makes problems easier to track down.

---

## Unit 3 | Sound, text and on-site testing (2 h)

**Goal**: design the sensory experience of crossing and run the first full test on a phone.

| Time | Activity | Notes |
|---|---|---|
| 0:00–0:20 | **Talk: the rhythm of crossing** | How does a one-shot effect (the moment) differ from a looping ambience (staying)? Is the on-screen text more like a gallery label or a narrator? Students complete question 4 of the planning sheet. |
| 0:20–0:50 | **Add sound and text** | Student Guide step 6. Students without their own sounds use the sample sounds. |
| 0:50–1:15 | **Publish** | Student Guide step 7: Publish → HTML5 → Build → upload as the class agreed → make a QR code. |
| 1:15–1:55 | **On-site testing** | In pairs, test each other's pieces using the four checks in step 8. Turn on debug info when something goes wrong. |
| 1:55–2:00 | **Homework** | Revise based on the test; complete questions 5–6 of the planning sheet. |

**Guiding question**: when viewers first see the doorway, do they want to step through? What makes them want to — the colour, the sound, or what they glimpse inside?

---

## Unit 4 | Exhibition and feedback (2 h)

**Goal**: finish the work, exhibit it, and exchange feedback.

| Time | Activity | Notes |
|---|---|---|
| 0:00–0:40 | **Final adjustments** | Fix settings and republish. Make an **exhibition label**: title, one-line description, QR code, and instructions ("tap the floor → walk through the doorway → turn around"). |
| 0:40–1:40 | **Exhibition** | 3–5 minutes per piece. The artist says nothing at first while classmates explore freely, then shares their plan. |
| 1:40–2:00 | **Feedback and reflection** | Everyone writes two sticky notes per piece: "At the moment of ___ I felt ___" and "It would be even better if ___". Close with a class discussion: how is an AR door different from a real one? |

---

## Explaining the principle (no code)

| What happens | Metaphor | Classroom demo |
|---|---|---|
| The world is visible only through the doorway | An **invisible curtain** surrounds the door. It hides the virtual world behind it but not the camera image. A door-shaped hole is cut in the middle. | Cut a door-shaped hole in a cardboard box and stick a photo inside: you see the photo only through the hole, and from the side you see only the box. |
| The panorama looks very far away | The panorama is painted on the inside of a **giant sphere that moves with you**, like the sky: however you walk, the moon follows you. | Have students walk while watching a distant hill and a nearby desk, and compare how each moves. |
| Only the doorway counts as entering | There is an **invisible tripwire** on the floor across the doorway. It only counts if you step over its middle; walking around the side doesn't. | Tape a line on the floor and have students cross it from different positions. |
| Looking back shows the real world | Once inside, a piece of "invisible cloth" sits in the doorway and cuts a hole in the other world, revealing the real one. | Imagine the cardboard box turned inside out. |

---

## Under the hood (optional, for digital media students)

Students don't edit any code, but digital media students may want to know how it works. These concepts connect to real-time graphics topics they will meet later. `portal-door.ts` is fully commented for anyone curious to read it.

| Concept | In this piece | Discussion prompt |
|---|---|---|
| **World tracking (SLAM)** | The phone builds a map of the floor from the camera image and motion sensors, so the door stays put. | Why do plain, shiny or dark floors fail? |
| **Depth-only occluders** | The "invisible curtain" is geometry that writes to the depth buffer but not the colour buffer (`colorWrite: false`), and is drawn first (`renderOrder`). | Where else could invisible occluders be useful in AR (e.g. hiding virtual objects behind real furniture)? |
| **Equirectangular mapping** | The panorama is wrapped on the inside of a sphere centred on the camera, so it has no parallax. | What would change if the sphere stayed still instead of following the viewer? |
| **Clipping planes** | Outside, only the half of the sphere behind the door plane is drawn. | Why not just draw the whole sphere all the time? |
| **Coordinate spaces** | The phone's position is converted into the door's own coordinate system (x = left/right, z = front/back). Turn on debug info to watch the numbers change. | Walk around the door with debug info on and map where `z` changes sign. |
| **State machine** | Two states — *real world* and *other world* — switch only when the movement path crosses the doorway. | Draw the state diagram. What would a third state (e.g. "in the doorway") add? |

---

## Assessment

| Criterion | Weight | Look for |
|---|---|---|
| Concept and plan | 30% | Why this world? Does the planning sheet clearly design the three moments: seeing, crossing, looking back? |
| World-building | 30% | Quality and composition of the panorama: what's straight through the doorway, what the viewer sees on turning around, how the seam is handled |
| Crossing experience | 25% | Do the door's form, the sound and the text fit the concept and have a sense of rhythm? |
| Completion and presentation | 15% | Works properly on a phone; clear exhibition label; the artist can guide viewers on site |

---

## Troubleshooting (instructor)

| Problem | Cause and fix |
|---|---|
| portal-door doesn't appear in the student's Inspector | `portal-door.ts` isn't in `src/`, or the project wasn't reopened. Also check the extension is `.ts`, not `.ts.txt`. |
| Two portal-doors in one scene | Only the first one works. Delete the extra one. |
| Black screen on the phone | The link isn't https, or camera access was denied. iPhone: Settings → Safari → Camera. |
| Works in the preview, but the phone can't find the floor | It's the environment: move to a brighter spot with a textured floor and sweep the phone side to side before placing. |
| Walking through the doorway doesn't switch | The viewer walks near the edge of the doorway, or the phone swings a lot. Set *Doorway margin* to 0.1, or widen the door. |
| Walking past the side also switches | Set *Doorway margin* to 0.25. |
| The panorama won't load | Check the format (.jpg recommended) and that the file name has no special characters. Images wider than 4096 px are shrunk automatically, so size isn't a problem. |
| No sound | Mobile browsers only play sound after the user taps the screen; this component starts sound on the tap that places the door. On iPhone, turn off the silent switch. |
| The door looks a different size for each student | This AR mode uses relative scale, which depends on how high the phone is held when the door is placed. Ask students to hold the phone at chest height when placing it, and adjust the door size if needed. |
| You want to see the phone's position data | Add `?debug=1` to the end of the link to turn on debug info without changing the Inspector. |

---

## Extensions (for fast finishers)

- **Same place, two times**: place the door in a location whose panorama shows that same place in the past (a panorama collaged from old photos).
- **The door ajar**: set a small open angle (e.g. 15) so viewers can only peek through the gap and must come close and step in to see the whole world.
- **Sound first**: use a dark or minimal panorama and tell the story mainly through ambience.
- **A corridor of doors**: install several students' pieces along one corridor as a sequence of thresholds.
