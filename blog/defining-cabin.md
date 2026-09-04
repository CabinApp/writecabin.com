## The Problem With Writing Software

I do not have major published works. I simply like writing, and as someone who likes software as much as writing, I have tried many different applications. I tried [Reedsy](https://reedsy.com) at first. I liked its interface and how I could clearly structure my chapters. It even supported parts, which I required for my book. Yet somewhere, the software creator inside me started taking over. Dark mode was paid. The interface felt a bit *full*. If I hid the sidebars, they weren't accessible when I wanted to refer across chapters.

And so, I left Reedsy. Don't get me wrong, it's a wonderful application, but it just wasn't made for me. Anyways, I then turned to [Obsidian](https://obsidian.md). It was already my primary note-taking application. I opened a new vault, researched a bit, and found the [Longform](https://community.obsidian.md/plugins/longform) plugin. I watched a YouTube tutorial and set everything up, complete with a custom theme, dashboard, and everything (as I said, my software creator side takes over sometimes). I worked in Obsidian for some time. But after a while, the background that had once seemed "cool" had become irritating, and I would have to [kludge](https://en.wikipedia.org/wiki/Kludge) together the final export system.

Once again, I switched the app. Currently, I am writing in [Novlr](https://novlr.com), because it has clear structure, stuff is accessible, and its dark mode is free :)

Oh, and I also **MUST** mention [Microsoft Word](https://www.microsoft.com/en-in/microsoft-365/word), in which I wrote my first few short stories. Needless to say, it has one of the least cluttered interfaces, but doesn't really work out across a longer story with multiple chapters needing to be cross-referenced. 

My overall problem was the fact that I had to change my workflow every time I changed software. I had to adapt to the software.

## Software That Adapts to the Writer

So after switching software for the third time, not to mention my little expeditions with other niche worldbuilding software which I installed and deleted in the span of a day.

So I sat.

And I thought.

*Hey, I know how to build apps (kinda)! Lemme build a writing app!*

And so, I began work on Cabin. I understood the core problem in all of the apps I used was one of complexity. Apps are either too minimalist with no structure, or too cluttered with a steep learning curve.

After more thinking, I came up with **progressive complexity**. Basically, the app is super minimalist, and you can add features as you go about writing your story. 

Want character notes for worldbuilding? Just add it to the interface!
Location notes? You can add that too!
Fantasy timeline? Sure, that too!
Bi-directional graph between characters with relationships marked on arrows? Uhh... sure! Why not?

After spending some time thinking about how I would actually implement this, I realised that I needed to cater to two very different kinds of users.
#### John

This is John. He is a first-time novelist and just has an idea. He found Cabin through a random post on the internet. For now, he just needs chapters and a space to write. He opens up Cabin, and, great! There are chapters on the left and the main manuscript in the center. He can immediately get to work!
#### Lisa

Lisa, on the other hand, is writing her fifth novel. She has used different writing apps, and stumbled across Cabin through a friend's recommendation. She opens the app, and its the same interface as John. Well, she also needs a place to write notes, because she has to keep a track of all the characters in her novel. She finds character notes under the components section. Great! Oh, but her story is divided into multiple Parts, which she has named "Islands" to match her narrative. She creates a chapter called "Island 1" and drags her current chapter onto it. "Chapter 1" goes neatly under "Island 1", and now she can have parts in her story!

I realised that I would have to cater to both kinds of users without either feeling that the app is too cluttered or too minimal or not having required features. This is where that idea of **progressive complexity** came in handy. Both writers are using the exact same app. John can reach Lisa's setup within minutes. Cabin starts minimal, and grows with you.

## What Followed

Based on the central idea of **progressive complexity**, I then developed a few more "rules" to govern the product.
#### Writing First
Cabin should always be a space to **write**. Panels, components, dashboards can all come later. Writing must come first.
#### Calm Before Clever
Before I try to anticipate user actions and come up with clever auto-adding systems for components, I need to ensure the interface is calm. A clever system can only be included if it does not impact the calmness of the application. Too many buttons and knobs will just make the interface overwhelming.
#### Local-First and File Ownership
Inspired by Obsidian, I decided that Cabin would be an application that stores all of your data on your device. There is no risk losing your book if Cabin disappears. Its always there on your device.
#### Flexibility Without Chaos
Cabin should have a flexible interface. You can place and resize components as you wish. You can have as many (sensible) components as you want. But within certain limits. There is no inherent need for 5 different panels all showing the same chapter hierarchy. A flexible interface within limits ensures it isn't chaotic.

## Building an Identity

The calming vibe I decided I want Cabin to have was just evocative of Scandinavian countries. While I have never been to one, I feel the serenity of snowy mountains captures the calmness of Cabin.

But first, let me address the name. I wanted something short and simple, and looked for names like Paper. But either they were too simple, or didn't have available domains. I finally settled on Cabin, as it ties in with the imagery of a wooden Cabin on a snowy mountain where you just sit and write.

I then established colour palettes and fonts in context of the actual app. The light mode palette, Dawn, is inspired by the image of a misty morning on a snowy mountain. The dark mode palette, Aurora, links to snowy nights with the *Aurora Borealis* shimmering in the night sky.

For my fonts, I chose [Geist](https://fonts.google.com/specimen/Geist) for the interface and [Lora](https://fonts.google.com/specimen/Lora) for the manuscript. These are currently designed to be defaults, as allowing custom fonts is easy when the app is on the user's device. I chose Geist as it was a clean sans-serif font, but felt a bit more measured compared to others like Roboto or Open Sans. Lora was just a readable serif font I found that looked good on long texts.

I then moved towards the logo design. I don't know at the time of writing what the FINAL logo is, but I'm assuming its a stylised version of a classical feather quill. I wanted to keep it clean and symbolic of the main purpose of Cabin.

## Cabin Is Now Defined

After quite a bit of brainstorming, I finally defined a core problem I wanted to address, how I would address it, named Cabin, decided its [philosophy](https://writecabin.com/philosophy.html), and created a visual identity.

Great! Now all I have to do is decide a bunch of stuff and actually make the thing :)