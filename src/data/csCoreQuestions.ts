import type { CSQuestion } from '../types';

export const csCoreQuestions: CSQuestion[] = [
  {
    id: 'os-process-vs-thread',
    subject: 'OS',
    category: 'Process Management',
    question: 'What is the difference between a Process and a Thread?',
    answer: `### Process vs Thread

A **Process** is an independent executing program instance that has its own isolated address space, memory, registers, and resources.
A **Thread** is the smallest unit of execution within a process, sharing the parent process's memory space and resources.

| Feature | Process | Thread |
|:---|:---|:---|
| **Memory** | Isolated address space. Cannot access other processes' memory without IPC. | Shares code, data, and OS resources with other threads of the parent process. |
| **Overhead** | High creation, deletion, and context switching overhead. | Low overhead. Context switching between threads is much faster. |
| **Communication**| Requires Inter-Process Communication (IPC) mechanisms (Pipes, Sockets, Shared Memory). | Direct communication via shared variables (needs synchronization). |
| **Failure Isolation**| If a process crashes, it does not affect other processes. | If a thread crashes (segmentation fault), it can crash the entire process. |`,
    visualConcept: `[Process Memory Space]
+------------------------------------+
| Code | Data | Heap | Stack         |  <-- Process 1
+------------------------------------+
  ^         ^
  |         |
[Thread 1] [Thread 2] <-- Share Code, Data, Heap; but have their own Stacks`
  },
  {
    id: 'os-deadlock',
    subject: 'OS',
    category: 'Synchronization',
    question: 'What is a Deadlock? What are the four necessary conditions for it to occur?',
    answer: `### Deadlock & Coffman Conditions

A **Deadlock** is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the set.

#### The 4 Coffman Conditions:
1. **Mutual Exclusion:** At least one resource must be held in a non-shareable mode (only one process can use it at a time).
2. **Hold and Wait:** A process must be holding at least one resource and waiting to acquire additional resources that are currently being held by other processes.
3. **No Preemption:** Resources cannot be forcibly taken from a process; they can only be released voluntarily by the process holding them.
4. **Circular Wait:** A closed chain of processes exists, where each process holds one or more resources that are needed by the next process in the chain.

#### Handling Deadlocks:
- **Prevention:** Eliminate one of the four conditions.
- **Avoidance:** Dynamically allocate resources only if the system remains in a "safe state" (e.g., **Banker's Algorithm**).
- **Detection & Recovery:** Let deadlocks occur, detect them via Resource Allocation Graphs, and recover by aborting processes or preempting resources.`,
    visualConcept: `P1 holds R1, waits for R2.
P2 holds R2, waits for R1.

(P1) === Holds ===> [R1] <=== Waits === (P2)
  ||                                      ||
  ||====== Waits ===> [R2] <=== Holds ====||`
  },
  {
    id: 'dbms-acid',
    subject: 'DBMS',
    category: 'Transactions',
    question: 'Explain ACID Properties in Database Transactions.',
    answer: `### ACID Properties

To maintain consistency and integrity in a database, transactions must follow ACID properties:

1. **Atomicity ("All or Nothing"):** 
   Ensures that either the entire transaction is completed successfully, or none of it is applied. If a transaction fails midway, the database is rolled back to its pre-transaction state.
   *Example: Transferring money. Debit from account A and Credit to account B must both succeed, or both fail.*

2. **Consistency (Preserves Rules):** 
   A transaction must transition the database from one valid state to another, maintaining all schema constraints, triggers, and rules.
   *Example: Account balances cannot fall below zero if defined by constraints.*

3. **Isolation (Concurrent Independence):** 
   Ensures that concurrent execution of transactions results in a system state equivalent to if they were executed sequentially. Transactions in progress are invisible to other transactions.
   *Solved via concurrency controls like Locking, Timestamp Ordering, and Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).*

4. **Durability (Permanent Write):** 
   Once a transaction commits, its modifications survive any subsequent system crash or power loss. Changes are permanently written to non-volatile storage (disk/logs).`
  },
  {
    id: 'dbms-joins',
    subject: 'DBMS',
    category: 'SQL Queries',
    question: 'Explain the different types of SQL Joins.',
    answer: `### SQL Joins

SQL Joins are used to combine rows from two or more tables based on a related column between them.

1. **INNER JOIN:**
   Returns records that have matching values in both tables. Intersection of Table A and Table B.
   \`\`\`sql
   SELECT * FROM Users INNER JOIN Orders ON Users.id = Orders.user_id;
   \`\`\`

2. **LEFT (OUTER) JOIN:**
   Returns all records from the left table, and the matched records from the right table. If no match, NULL values are returned for the right table columns.
   \`\`\`sql
   SELECT * FROM Users LEFT JOIN Orders ON Users.id = Orders.user_id;
   \`\`\`

3. **RIGHT (OUTER) JOIN:**
   Returns all records from the right table, and the matched records from the left table. If no match, NULL values are returned for the left table.

4. **FULL (OUTER) JOIN:**
   Returns all records when there is a match in either left or right table. Combines Left and Right join results.

5. **CROSS JOIN:**
   Returns the Cartesian product of the two tables (every row of Table A matched with every row of Table B).`
  },
  {
    id: 'cn-tcp-udp',
    subject: 'CN',
    category: 'Transport Layer',
    question: 'Compare TCP and UDP protocols.',
    answer: `### TCP vs UDP

**TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** are the two primary Transport Layer protocols.

| Feature | TCP | UDP |
|:---|:---|:---|
| **Connection Style** | Connection-Oriented. Requires 3-way handshake (\`SYN\`, \`SYN-ACK\`, \`ACK\`). | Connectionless. Sends packets directly without setup. |
| **Reliability** | Highly Reliable. Guarantees packet delivery, retransmits lost packets. | Unreliable. No guarantee of delivery or packet ordering. |
| **Flow & Congestion Control** | Yes. Throttles rate if network is congested. | No. Sends data as fast as possible. |
| **Speed** | Slower (due to headers, handshakes, and checks). | Much faster. Minimal overhead. |
| **Header Size** | 20 bytes minimum. | 8 bytes. |
| **Typical Use Cases** | Web Browsing (HTTP), Email (SMTP), File Transfer (FTP), SSH. | Video Streaming, Online Gaming, DNS, VoIP. |`
  },
  {
    id: 'sd-caching',
    subject: 'System Design',
    category: 'Scalability',
    question: 'What is Caching? What are the common cache eviction policies and writing strategies?',
    answer: `### Caching in System Design

**Caching** is the process of storing copies of data in high-speed, temporary memory (like RAM) so that future requests can be served much faster than fetching from database or disk.

#### Cache Eviction Policies:
- **LRU (Least Recently Used):** Discards the least recently accessed items first.
- **LFU (Least Frequently Used):** Discards items with the lowest access count.
- **FIFO (First In First Out):** Discards the oldest items first.

#### Cache Writing Strategies:
1. **Cache-Aside (Lazy Loading):**
   - Application queries cache first. If a *cache miss* occurs, it reads from the DB, stores it in the cache, and returns it.
   - *Pros:* Only requested data is cached. DB/Cache schema sync is simple.
   - *Cons:* Cache miss causes higher latency on first load.
2. **Write-Through:**
   - Application writes data directly to both cache and DB simultaneously.
   - *Pros:* Cache is never stale. Low read latency.
   - *Cons:* Write penalty (must write to two places).
3. **Write-Back (Write-Behind):**
   - Application writes only to cache, and cache asynchronously queues the write to the DB later.
   - *Pros:* Super-fast write performance. Good for write-heavy applications.
   - *Cons:* Risk of data loss if the cache server crashes before data is synced to DB.`
  },
  {
    id: 'oops-solid',
    subject: 'OOPs',
    category: 'Design Patterns',
    question: 'What are the SOLID principles of Object-Oriented Design?',
    answer: `### SOLID Principles

SOLID is a set of five design principles to make software designs more understandable, flexible, and maintainable.

1. **S - Single Responsibility Principle (SRP):**
   A class should have one, and only one, reason to change. It should do only one job.
   *Example: Don't put DB saving logic inside the UserProfile presentation class.*

2. **O - Open/Closed Principle (OCP):**
   Software entities (classes, modules, functions) should be open for extension, but closed for modification.
   *Example: Use inheritance or interfaces rather than altering existing production code when adding features.*

3. **L - Liskov Substitution Principle (LSP):**
   Subtypes must be substitutable for their base types without altering the correctness of the program.
   *Example: A \`Square\` class extending \`Rectangle\` can break height/width adjustments if not designed carefully.*

4. **I - Interface Segregation Principle (ISP):**
   Clients should not be forced to depend on interfaces they do not use. Prefer many small, specific interfaces over one fat, general interface.

5. **D - Dependency Inversion Principle (DIP):**
   High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces). Abstractions should not depend on details; details should depend on abstractions.`
  }
];
