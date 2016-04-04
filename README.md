#jsprinter - easy-standup print to file server

##usage
`npm start` will launch. Printer ipp address and joblist urls will be printed to
the console. Print with any driver to the ipp address, retrieve jobs from the
joblist address. The jobs will be cleared/lost when the server is stopped.

Environment variables can be used to specify ports:
```
JOBLIST_PORT=80 IPP_PORT=632 DEBUG=jsprinter npm start
```

If run as root, should de-escalate to nobody:nogroup.

Pre-10 Windows users can use Generic Microsoft Publisher Color Printer driver to
generate postscript, and 10 users can use the Generic Microsoft PDF driver for
pdf output. Other drivers will generate different (and maybe less usable)
output.

##contributing
Please feel free to submit Pull Requests. If I like them, I'll add you as
contributor. Please squash commits to help me like them.

