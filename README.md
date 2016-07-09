# shellbuddy
Quickly bookmark hard-to-remember shell commands 

# Configs
1. Add following lines to your .bash_rc file:

```
export HISTSIZE=-1

export HISTFILESIZE=-1

export HISTTIMEFORMAT="%F %T "

alias buddy="node <path to shellbuddy.js>"
```

2. Edit shellbuddy.js to make sure historyjson_path points to your bash history file

# Usage

*buddy php*
 search for bookmarks containing 'php'

*buddy -l*
 list all bookmarks

*buddy -h*
 see recent bash history

*buddy -a reload mysql*
 bookmark the last bash command with given 
 
*buddy -a install LAMP -mc 3 8*
 bookmark command #3 and #8 with given comment. 
 must run buddy -h first to get command numbers.

*buddy -r 3*
 remove bookmark #3 obtained from buddy -l
