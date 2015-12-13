#jsprinter - easy-standup print to file server
##usage
`npm start` will launch. Printer ipp address and joblist urls will be printed to
the console. Print with any driver to the ipp address, retrieve jobs from the
joblist address. The jobs are currently stored in-memory, and will be
cleared/lost when the server is stopped.

Pre-10 Windows users can use Generic Microsoft Publisher Color Printer driver to
generate postscript, and 10 users can use the Generic Microsoft PDF driver for
pdf output. Other drivers will generate different (and maybe less usable)
output.

##TODO:
* change in-memory to temp file with the node temp package to reduce memory
usage
* identify file type with node file-type package to determine extension/mimetype
(currently hard-coded to postscript)
