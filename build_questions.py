"""Convert the PDF and book question worksheets into browser data."""
import json
from pathlib import Path

from openpyxl import load_workbook

SOURCES = [
    ("itquesupdated.xlsx", "IT Questions for Quiz", "pdf"),
    ("bookquesupdated.xlsx", "Book Questions", "book"),
]
TARGET = Path("questions.js")


def text(value):
    return "" if value is None else str(value).strip()


questions = []
for filename, sheet_name, source in SOURCES:
    workbook = load_workbook(filename, read_only=True, data_only=True)
    sheet = workbook[sheet_name]
    source_count = 0
    for row in sheet.iter_rows(min_row=2, values_only=True):
        number = row[0]
        if not isinstance(number, (int, float)):
            continue  # Section labels and blank rows.
        question = {
            "id": f"{source}-{int(number)}",
            "number": int(number),
            "source": source,
            "topic": text(row[1]),
            "question": text(row[2]),
            "options": [text(value) for value in row[3:7]],
            "answer": text(row[7]).upper()[:1],
        }
        while question["options"] and not question["options"][-1]:
            question["options"].pop()
        if not question["topic"] or not question["question"] or len(question["options"]) < 2 or question["answer"] not in "ABCD":
            raise SystemExit(f"Incomplete question in {filename}: row {number}.")
        questions.append(question)
        source_count += 1
    if source_count == 0:
        raise SystemExit(f"No questions found in {filename} ({sheet_name}).")
    workbook.close()

TARGET.write_text(
    "// Generated from itquesupdated.xlsx and bookquesupdated.xlsx. Run build_questions.py after updating either workbook.\n"
    + "window.QUIZ_QUESTIONS = "
    + json.dumps(questions, ensure_ascii=False, separators=(",", ":"))
    + ";\n",
    encoding="utf-8",
)
print(f"Wrote {len(questions)} questions to {TARGET}")
