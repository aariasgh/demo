from pathlib import Path
import yaml
p = Path('_bmad-output/implementation-artifacts/sprint-status.yaml')
status = yaml.safe_load(p.read_text(encoding='utf-8'))['development_status']

story_total = story_done = story_backlog = story_ready = story_in_progress = story_review = 0
for key, value in status.items():
    if isinstance(value, dict) and 'title' in value and 'status' in value:
        story_total += 1
        s = value['status']
        if s == 'done':
            story_done += 1
        elif s == 'backlog':
            story_backlog += 1
        elif s == 'ready-for-dev':
            story_ready += 1
        elif s == 'in-progress':
            story_in_progress += 1
        elif s == 'review':
            story_review += 1

epic_total = epic_done = epic_in_progress = epic_backlog = 0
for key, value in status.items():
    if key.startswith('epic-') and isinstance(value, str):
        epic_total += 1
        if value == 'done':
            epic_done += 1
        elif value == 'in-progress':
            epic_in_progress += 1
        elif value == 'backlog':
            epic_backlog += 1

print({'epic_total': epic_total, 'epic_done': epic_done, 'epic_in_progress': epic_in_progress, 'epic_backlog': epic_backlog,
       'story_total': story_total, 'story_done': story_done, 'story_backlog': story_backlog, 'story_ready': story_ready,
       'story_in_progress': story_in_progress, 'story_review': story_review})
