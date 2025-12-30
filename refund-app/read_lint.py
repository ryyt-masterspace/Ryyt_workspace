import codecs
with codecs.open('lint-final-all.txt', 'r', 'utf-16le') as f:
    print(f.read().encode('utf-8').decode('utf-8'))
