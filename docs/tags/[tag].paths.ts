export default {
  paths: () => {
    const tags: string[] = [
      'meta',
      'diary',
      'consciousness',

      'quotation/prose+novel+theory',
      'log/dev+life',
      'roadmap/blog_site',
      'lookup/mathjax',
      'index/mathjax',

      'explore/mathjax',
      'language/mathjax',

      'symbol/greek',

      'absurdism',
      'modernism',
      'psychoanalysis',
      'feminism',

      'cioran',
      'camus',
    ]

    let paths: Set<string> = new Set()

    tags.forEach((tag) => {
      const thisPaths: Set<string> = new Set()
      tag.split('/').forEach((h, i, t) => {
        h.split('+').forEach((t2) => {
          thisPaths.add([...t.slice(0, i), t2].join('/'))
        })
      })

      paths = new Set([...paths, ...thisPaths])
    })

    console.warn(paths)

    return Array.from(paths).map(path => ({ params: { tag: path } }))
  },
  // paths: () => [
  //   { params: { tag: 'meta' } },

  //   { params: { tag: 'quotation' } },
  //   { params: { tag: 'quotation/prose' } },
  //   { params: { tag: 'quotation/novel' } },
  //   { params: { tag: 'quotation/theory' } },

  //   { params: { tag: 'modernism' } },
  //   { params: { tag: 'absurdism' } },
  //   { params: { tag: 'psychoanalysis' } },

  //   { params: { tag: 'camus' } },
  //   { params: { tag: 'cioran' } },

  //   { params: { tag: 'diary' } },
  //   { params: { tag: 'consciousness' } },

  //   { params: { tag: 'dev' } },

  //   { params: { tag: 'log' } },

  //   { params: { tag: 'roadmap' } },
  //   { params: { tag: 'roadmap/blog_site' } },
  // ],
}
