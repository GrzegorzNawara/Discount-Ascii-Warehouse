Dev notes
Discount Ascii Warehouse
====

All the features were implemented.
I used just plain javascript and standard bootstrap 4 css.
Page is responsive, mobile-first, should work on older browsers as well.

With no CI-book I just used some all-white minimalistic theme. But I couldn't resist but put some funny background to match the kitties :)
I made logo and background by myself - hope you like it.
Spinner gif used was created with loading.io

Page is ready for usual last-moment changes in data structure. 
To add more data-driven product description or change the ads layout you just need to modify html - no need to change javascrit code.
That approach always saves some time and stress before deadline :)

I would suggest Product Owner adding sorting by date.
I would also ask for usage scenario on sorting by "id" - I made a wild guess it could be used for some Id Collectror's Club :)

Expansion ideas are marked in the comments as TODO.

I've added small data translation solution to show-off :)
This should be coupled with content translation for real multi-language experience.

I've been thinking about adding gamification tool also but decided it would be too much.
Gamification idea:
- some product offers (like 1-5%) are locked - you cannot buy them
- you gain points (in a form of stars flying to your level bar) for looking at products, clicking ads and buying products
- points are collected on sticky footer as level progress bar
- once you reach new level, you get access to locked products (crowds cheering)

I didn't split the solution into html/css/js files for clarity.
I didn't add automated testing.

End-of-catalogue message is something I'm less than happy with.
But there is no clear way to identify end of data.


