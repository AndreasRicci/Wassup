#!/usr/bin/python

import pprint

import wassup

'''
This utility simply prints out the DB's contents. Useful for debugging.
'''


def print_db():
    app_db = wassup.app_db_load_from_file()
    pprint.pprint(app_db)


if __name__ == '__main__':
    print_db()
