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
2. Make sure to edit last line with path.

3. Edit shellbuddy.js to make sure historyjson_path points to your bash history file

# Usage

* _buddy php_  - search for bookmarks containing 'php'

* _buddy -l_ list all bookmarks

* _buddy_  - see recent bash history

* _buddy -a reload mysql_ - bookmark the last bash command with given 
 
* _buddy -a install LAMP -mc 3 8_ - bookmark command #3 and #8 with given comment. must run buddy -h first to get command numbers.

* _buddy -r 3_ - remove bookmark #3 obtained from buddy -l
