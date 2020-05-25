#!/usr/bin/env python
import argparse
import os
import subprocess
import re
import sys
from collections import namedtuple


class Tag(object):
    COMPILE_CMD = 'COMPILE-CMD'
    RUN_CMD = 'RUN-CMD'
    BEGIN_SNIPPET = 'BEGIN-SNIPPET'
    END_SNIPPET = 'END-SNIPPET'


class Ext(object):
    JAVA = ".java"
    JS = ".js"
    R = ".r"
    C = ".c"
    RUBY = ".rb"
    LLIBC = ".bc"
    PYTHON = ".py"


TYPES_TO_COMPILE = frozenset([
    Ext.JAVA,
    Ext.C,
    Ext.LLIBC
])


ALL_TYPES = frozenset([
    Ext.JAVA,
    Ext.JS,
    Ext.R,
    Ext.C,
    Ext.RUBY,
    Ext.PYTHON,
    Ext.LLIBC
])


PATTERN_COMPILE_CMD = re.compile(r'(?P<tag>{}):\s*(?P<cmd>.*)'.format(Tag.COMPILE_CMD))
PATTERN_RUN_CMD = re.compile(r'(?P<tag>{}):\s*(?P<cmd>.*)'.format(Tag.RUN_CMD))
PATTERN_SNIPPET = re.compile(r'(?P<begin>{})(?P<code>.*)(?P<end>{})'.format(Tag.BEGIN_SNIPPET, Tag.END_SNIPPET),
                             re.DOTALL | re.MULTILINE)


SnippetInfo = namedtuple('SnippetInfo', [
    'compile_cmd',
    'run_cmd',
    'snippet',
])


def warn(msg):
    print >> sys.stderr, '\033[31m{}\033[0m'.format(msg)


def readable_dir(prospective_dir):
    if not os.path.isdir(prospective_dir):
        raise Exception("readable_dir:{0} is not a valid path".format(prospective_dir))
    if os.access(prospective_dir, os.R_OK):
        return prospective_dir
    else:
        raise Exception("readable_dir:{0} is not a readable dir".format(prospective_dir))


def get_examples(examples_path):
    for root, subdir, files in os.walk(examples_path):
        for file in files:
            _, ext = os.path.splitext(file)
            if ext in ALL_TYPES:
                yield os.path.join(root, file)


def get_parser():
    parser = argparse.ArgumentParser(description='Test and run Graal documentation examples.')
    parser.add_argument('examples', metavar='EXAMPLES', type=readable_dir,
                        help='The location to search for examples to run')
    parser.add_argument('-i', '--ignore-errors', action='store_true')
    parser.add_argument('-g', '--graal-vm-home', dest='graal_vm_home', default=os.environ.get('GRAAL_VM_HOME', None),
                        help='The GraalVM home path')
    return parser


def get_pattern(pattern, content, subgroup=None):
    return filter(lambda item: item is not None,
                  [match.groupdict().get(subgroup, None) for match in pattern.finditer(content)])


def get_one_pattern(pattern, content, subgroup=None):
    results = get_pattern(pattern, content, subgroup=subgroup)
    if len(results) == 0:
        return None
    elif len(results) > 1:
        raise ValueError('pattern {} matched more than once ({})'.format(pattern, len(results)))
    return results[0]


def parse_example(example_file):
    if isinstance(example_file, basestring):
        content = example_file
    elif hasattr(example_file, 'read'):
        content = example_file.read()
    else:
        raise ValueError('example file objects of type: {} are not yet supported'.format(type(example_file)))

    _, ext = os.path.splitext(example_file.name)

    # compilation
    compile_cmd = get_one_pattern(PATTERN_COMPILE_CMD, content, 'cmd')
    if compile_cmd is None and ext in TYPES_TO_COMPILE:
        warn('example is missing the {tag} tag, {ext} examples require compilation'.format(
            tag=Tag.COMPILE_CMD, ext=ext[1:]))

    # running
    run_cmd = get_pattern(PATTERN_RUN_CMD, content, 'cmd')
    if len(run_cmd) == 0:
        warn('example is missing the {tag} tag, at least 1 {tag} must be specified'.format(tag=Tag.RUN_CMD))

    # the actual code
    snippet = get_one_pattern(PATTERN_SNIPPET, content, 'code')
    if snippet is None:
        warn('example is missing the {}, {} tags'.format(Tag.BEGIN_SNIPPET, Tag.END_SNIPPET))

    return SnippetInfo(compile_cmd, run_cmd, snippet)


def _run(command, cwd=None, env=None):
    return subprocess.check_output(command.split(), cwd=cwd, env=env)


def get_cmd_pattern(cmd_pattern, graal_vm_home):
    if graal_vm_home:
        graal_vm_cmd_pattern = '{}/bin/{}'.format(graal_vm_home, cmd_pattern)
        if os.path.isfile(graal_vm_cmd_pattern.split(' ')[0]):
            return graal_vm_cmd_pattern
    return cmd_pattern


def compile_example(example_file_name, snippet_info, graal_vm_home=None, env=None):
    base_path = os.path.dirname(example_file_name)
    base_name = os.path.basename(example_file_name)
    name, ext = os.path.splitext(base_name)

    cmd_pattern = get_cmd_pattern(snippet_info.compile_cmd, graal_vm_home)

    if ext == Ext.JAVA:
        compile_cmd = cmd_pattern.format(file=base_name)
        print("[JAVA COMPILE] cwd:{}, {}".format(base_path, compile_cmd))
        print(_run(compile_cmd, cwd=base_path, env=env))


def run_example(example_file_name, snippet_info, graal_vm_home=None, env=None):
    base_path = os.path.dirname(example_file_name)
    base_name = os.path.basename(example_file_name)
    name, ext = os.path.splitext(base_name)

    for _run_cmd in snippet_info.run_cmd:
        cmd_pattern = get_cmd_pattern(_run_cmd, graal_vm_home)

        if ext == Ext.JAVA:
            run_cmd = cmd_pattern.format(file=name)
            print("[JAVA RUN] cwd:{} {}".format(base_path, run_cmd))
            print(_run(run_cmd, cwd=base_path, env=env))
        else:
            run_cmd = cmd_pattern.format(file=base_name)
            print("[CMD]  cwd:{} {}".format(base_path, run_cmd))
            print(_run(run_cmd, cwd=base_path, env=env))


def cli():
    parser = get_parser()
    args = parser.parse_args()
    graal_vm_home = args.graal_vm_home

    examples_path = os.path.abspath(args.examples)

    for example_file in get_examples(examples_path):
        print("testing {}".format(example_file))
        with open(example_file, 'r') as EXAMPLE_FILE:
            try:
                snippet_info = parse_example(EXAMPLE_FILE)

                if snippet_info.compile_cmd:
                    print("compiling ... ")
                    compile_example(example_file, snippet_info, graal_vm_home=graal_vm_home)

                print("running ...")
                run_example(example_file, snippet_info, graal_vm_home=graal_vm_home)
            except Exception as e:
                if args.ignore_errors:
                    print(e)
                else:
                    raise

if __name__ == '__main__':
    cli()
