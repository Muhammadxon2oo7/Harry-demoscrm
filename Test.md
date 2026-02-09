# Test Management System - Development Requirements

## Overview
Create a comprehensive test/quiz creation and management system for admins and teachers. The system should allow creating weekly tests with unique IDs that students use to access and take the tests.

## Core Features

### 1. Test Creation Interface
- **Subject Selection**: Choose from available subjects/courses
- **Test Metadata**:
  - Test name/title
  - Unique test ID (auto-generated, acts as access key for students)
  - Description (optional)
  - Time limit (optional)
  - Available from/to dates

### 2. Question Types
Support two question formats:

**A) Multiple Choice Questions (a, b, c, d...)**
- Question text
- Multiple answer options (minimum 2, maximum 10)
- Mark correct answer(s)
- Support for single or multiple correct answers
- Option to add images to questions/answers

**B) Open-Ended/Written Questions**
- Question text
- Text area for student response
- Correct answer/model answer for reference
- Point value

### 3. Test Building Workflow
1. Create new test → Enter test details
2. Add questions one by one OR bulk import
3. For each question:
   - Select question type (multiple choice or open-ended)
   - Enter question text
   - Add answer options
   - **Mark the correct answer(s)** - CRITICAL
   - Assign point value
4. Reorder questions via drag-and-drop
5. Preview test before publishing
6. Save as draft OR publish immediately

### 4. Key Requirements
- **Unlimited questions** per test
- **Mix question types** in same test
- **Question bank**: Save questions for reuse
- **Edit/Delete** questions and tests
- **Duplicate tests** for quick creation
- **Test statistics**: Track completion rates, average scores

### 5. UI/UX Priorities
- Clean, intuitive interface (similar to Google Forms or Typeform)
- Visual question editor with WYSIWYG capabilities
- Clear indication of correct answers during creation
- Mobile-responsive design
- Easy navigation between questions

### 6. Student Access
- Students enter unique test ID to access
- One-time or multiple attempt options
- Auto-submit when time expires ( optional)

## Technical Notes
- Generate unique, easy-to-share test IDs (e.g., 6-character codes)
- Store correct answers securely
- Support rich text formatting in questions
- Export results to Excel/CSV
- Print-friendly test format

## Success Criteria
The system is successful when an admin/teacher can:
1. Create a complete test in under 10 minutes
2. Easily mark correct answers for all questions
3. Share test ID with students effortlessly
4. View and analyze results quickly

Build this with a focus on **simplicity, speed, and reliability**.