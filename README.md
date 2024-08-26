# Brush Rendering Tutorial
We provide very detailed technical description with interactive code blocks here: https://shenciao.github.io/brush-rendering-tutorial/

# Introduction

![](./static/img/vanilla-stroke.png)

This is the code repository for "Brush Rendering Tutorial".
Remember to star this code repository instead of bookmark the website since the host and domain might be changed.

The website will be WIP for a long time since rendering brush strokes with GPU is a newly emerged research topic.
We (Shen Ciao, Zhongyue Guan) will continuously update tutorials on (potentially) influential research works.

## Be critical

The most contents come from Shen Ciao and Li-yi Wei's research _[Ciallo][Ciallo]_ with title **_Ciallo: GPU-Accelerated Rendering of Vector Brush Strokes_** in SIGGRAPH 2024, and title **_Ciallo: The next-generation vector paint program_** in SIGGRAPH 2023.
It's impossible to create a perfect tutorial in the first place, so we eagerly need critiques and suggestions.
You can create issues or pull requests to fix typos, correct facto mistakes, and revise terrible terminology naming in this tutorial.

## Build and Develop

The textual contents are written in markdown, you can easily modify them without extra web development skills.

Follow the guidance in [Docusaurus's documentation](https://docusaurus.io/docs/installation) for further development.

The project is built with javascript libraries include:

- [docusaurus](https://docusaurus.io/): Main framework
- threejs: WebGL wrapper
- monaco-editor/react: Code editor

While creating this tutorial, shen has just started learning these JavaScript libraries.
If you are familiar with these libraries and have some engineering suggestions, please raise them in the issue.
Welcome any helps to improve the code editor.

## Citation
SIGGRAPH 2024 Technical Paper (Conference Track)

    @inproceedings{Ciallo2024,
      author    = {Shen Ciao and Zhongyue Guan and Qianxi Liu and Li-Yi Wei and Zeyu Wang},
      title     = {{Ciallo: GPU-Accelerated Rendering of Vector Brush Strokes}},
      booktitle = {Special Interest Group on Computer Graphics and Interactive Techniques Conference Conference Papers '24 (SIGGRAPH Conference Papers '24)},
      year      = {2024},
      date      = {2024-07-27/2024-08-01},
      venue     = {Denver, CO, USA},
      publisher = {ACM},
      address   = {New York, NY, USA},
      pages     = {1--11},
      doi       = {10.1145/3641519.3657418},
      url       = {https://doi.org/10.1145/3641519.3657418}

SIGGRAPH 2023 Talk

    @inproceedings{Ciallo,
        author = {Ciao, Shen and Wei, Li-Yi},
        title = {Ciallo: The next-Generation Vector Paint Program},
        year = {2023},
        isbn = {9798400701436},
        publisher = {Association for Computing Machinery},
        address = {New York, NY, USA},
        url = {https://doi.org/10.1145/3587421.3595418},
        doi = {10.1145/3587421.3595418},
        booktitle = {ACM SIGGRAPH 2023 Talks},
        articleno = {67},
        numpages = {2},
        keywords = {Digital painting, stylized stroke, arrangement, vector graphics. coloring, graphics processing unit (GPU)},
        location = {Los Angeles, CA, USA},
        series = {SIGGRAPH '23}
    }

## License

Shield: [![CC BY-SA 4.0][cc-by-sa-shield]][cc-by-sa]

This work is licensed under a
[Creative Commons Attribution-ShareAlike 4.0 International License][cc-by-sa].

[![CC BY-SA 4.0][cc-by-sa-image]][cc-by-sa]

Feel free to use the code, algorithms and demo images in your academic or commercial project, but you cannot state them are original.

The project will change into a copyleft license after updating the content about the 3D stroke.

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://licensebuttons.net/l/by-sa/4.0/88x31.png
[cc-by-sa-shield]: https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg
[Ciallo]: https://github.com/ShenCiao/Ciallo
